const express = require('express');
const router = express.Router();
const { run, get, all } = require('../data/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/donations - Protected
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, donation_type, search } = req.query;
    let sql = 'SELECT * FROM donations WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND payment_status = ?';
      params.push(status);
    }

    if (donation_type) {
      sql += ' AND donation_type = ?';
      params.push(donation_type);
    }

    if (search) {
      sql += ' AND (donor_name LIKE ? OR donor_email LIKE ? OR donor_phone LIKE ? OR transaction_ref LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY created_at DESC';
    const donations = await all(sql, params);

    // Calculate totals
    const totalRow = await get('SELECT SUM(amount) as totalAmount, COUNT(*) as totalCount FROM donations WHERE payment_status = "Verified" OR payment_status = "Successful"');

    return res.json({
      success: true,
      donations,
      stats: {
        totalAmount: totalRow.totalAmount || 0,
        totalCount: totalRow.totalCount || 0
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/donations/export - Protected CSV Export
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const list = await all('SELECT * FROM donations ORDER BY id ASC');
    const headers = ['ID', 'Donor Name', 'Email', 'Phone', 'PAN', 'Amount (INR)', 'Type', 'Status', 'Transaction Ref', 'Payment Method', 'Notes', 'Date'];

    const rows = list.map(d => [
      d.id,
      `"${(d.donor_name || '').replace(/"/g, '""')}"`,
      `"${(d.donor_email || '').replace(/"/g, '""')}"`,
      `"${(d.donor_phone || '').replace(/"/g, '""')}"`,
      `"${(d.donor_pan || '').replace(/"/g, '""')}"`,
      d.amount,
      d.donation_type,
      d.payment_status,
      `"${(d.transaction_ref || '').replace(/"/g, '""')}"`,
      `"${(d.payment_method || '').replace(/"/g, '""')}"`,
      `"${(d.notes || '').replace(/"/g, '""')}"`,
      d.created_at
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=mannum_maramum_donations_${Date.now()}.csv`);
    return res.send(csvContent);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/donations (Public submission connected to #donorForm)
router.post('/', async (req, res) => {
  try {
    const { donor_name, donor_email, donor_phone, donor_pan = '', amount, donation_type = 'one-time', transaction_ref = '', notes = '' } = req.body;

    const parsedAmount = parseFloat(amount);
    if (!donor_name || !donor_email || !donor_phone || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid donor name, email, phone number, and donation amount are required.'
      });
    }

    const ref = transaction_ref || `MMI-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    const result = await run(
      `INSERT INTO donations (donor_name, donor_email, donor_phone, donor_pan, amount, donation_type, payment_status, transaction_ref, notes)
       VALUES (?, ?, ?, ?, ?, ?, 'Verified', ?, ?)`,
      [donor_name.trim(), donor_email.trim(), donor_phone.trim(), donor_pan.trim().toUpperCase(), parsedAmount, donation_type, ref, notes.trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Thank you for your generous contribution to Mannum Maramum Iyakkam! Your support helps plant trees and protect native soil.',
      donationId: result.id,
      transactionRef: ref
    });
  } catch (error) {
    console.error('Donation record error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/donations/:id (Protected - Update verification status or notes)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const donationId = req.params.id;
    const { payment_status, notes } = req.body;

    await run(
      `UPDATE donations SET payment_status = ?, notes = ? WHERE id = ?`,
      [payment_status, notes, donationId]
    );

    return res.json({ success: true, message: 'Donation record updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
