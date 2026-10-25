const express = require('express');
const router = express.Router();
const { run, get, all } = require('../data/database');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/partnerships - Protected
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, org_type, search } = req.query;
    let sql = 'SELECT * FROM partnerships WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (org_type) {
      sql += ' AND org_type = ?';
      params.push(org_type);
    }

    if (search) {
      sql += ' AND (org_name LIKE ? OR contact_name LIKE ? OR contact_email LIKE ? OR contact_mobile LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY created_at DESC';
    const submissions = await all(sql, params);

    const parsed = submissions.map(s => ({
      ...s,
      focus_areas: s.focus_areas ? JSON.parse(s.focus_areas) : [],
      districts_selected: s.districts_selected ? JSON.parse(s.districts_selected) : [],
      documents: s.documents ? JSON.parse(s.documents) : []
    }));

    return res.json({ success: true, partnerships: parsed });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/partnerships/export - Protected CSV Export
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const list = await all('SELECT * FROM partnerships ORDER BY id ASC');
    const headers = ['ID', 'Org Type', 'Org Name', 'Reg No', 'GST No', 'PAN No', 'Website', 'Address', 'District', 'PIN', 'Contact Name', 'Designation', 'Mobile', 'Email', 'Duration', 'Focus Areas', 'Districts', 'Status', 'Internal Notes', 'Date'];

    const rows = list.map(p => {
      const focus = p.focus_areas ? JSON.parse(p.focus_areas).join('; ') : '';
      const dists = p.districts_selected ? JSON.parse(p.districts_selected).join('; ') : '';
      return [
        p.id,
        p.org_type,
        `"${(p.org_name || '').replace(/"/g, '""')}"`,
        `"${(p.reg_no || '').replace(/"/g, '""')}"`,
        `"${(p.gst_no || '').replace(/"/g, '""')}"`,
        `"${(p.pan_no || '').replace(/"/g, '""')}"`,
        `"${(p.website || '').replace(/"/g, '""')}"`,
        `"${(p.address || '').replace(/"/g, '""')}"`,
        `"${(p.district || '').replace(/"/g, '""')}"`,
        `"${(p.pincode || '').replace(/"/g, '""')}"`,
        `"${(p.contact_name || '').replace(/"/g, '""')}"`,
        `"${(p.contact_designation || '').replace(/"/g, '""')}"`,
        `"${(p.contact_mobile || '').replace(/"/g, '""')}"`,
        `"${(p.contact_email || '').replace(/"/g, '""')}"`,
        `"${(p.duration || '').replace(/"/g, '""')}"`,
        `"${focus.replace(/"/g, '""')}"`,
        `"${dists.replace(/"/g, '""')}"`,
        p.status,
        `"${(p.internal_notes || '').replace(/"/g, '""')}"`,
        p.created_at
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=mannum_maramum_partnerships_${Date.now()}.csv`);
    return res.send(csvContent);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/partnerships (Public submission connected to #mmiPartnershipForm)
router.post('/', upload.fields([
  { name: 'orgLogo', maxCount: 1 },
  { name: 'regCert', maxCount: 1 },
  { name: 'brochure', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      org_type,
      org_name,
      reg_no = '',
      gst_no = '',
      pan_no = '',
      website = '',
      address = '',
      district = '',
      pincode = '',
      contact_name,
      contact_designation = '',
      contact_mobile,
      contact_alt_mobile = '',
      contact_email,
      duration = '',
      focus_areas = [],
      districts_selected = []
    } = req.body;

    if (!org_type || !org_name || !contact_name || !contact_mobile || !contact_email) {
      return res.status(400).json({
        success: false,
        message: 'Organization type, Organization name, Contact name, Mobile, and Email are required.'
      });
    }

    const focusJson = Array.isArray(focus_areas) ? JSON.stringify(focus_areas) : (typeof focus_areas === 'string' ? focus_areas : '[]');
    const distJson = Array.isArray(districts_selected) ? JSON.stringify(districts_selected) : (typeof districts_selected === 'string' ? districts_selected : '[]');

    let logoPath = '';
    const docs = [];
    if (req.files) {
      if (req.files.orgLogo && req.files.orgLogo[0]) {
        logoPath = `/uploads/documents/${req.files.orgLogo[0].filename}`;
      }
      if (req.files.regCert && req.files.regCert[0]) {
        docs.push(`/uploads/documents/${req.files.regCert[0].filename}`);
      }
      if (req.files.brochure && req.files.brochure[0]) {
        docs.push(`/uploads/documents/${req.files.brochure[0].filename}`);
      }
    }

    const result = await run(
      `INSERT INTO partnerships (
        org_type, org_name, reg_no, gst_no, pan_no, website, address, district, pincode,
        contact_name, contact_designation, contact_mobile, contact_alt_mobile, contact_email,
        duration, focus_areas, districts_selected, logo_path, documents, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        org_type, org_name.trim(), reg_no.trim(), gst_no.trim(), pan_no.trim(), website.trim(),
        address.trim(), district.trim(), pincode.trim(), contact_name.trim(), contact_designation.trim(),
        contact_mobile.trim(), contact_alt_mobile.trim(), contact_email.trim().toLowerCase(),
        duration, focusJson, distJson, logoPath, JSON.stringify(docs)
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Partnership request submitted successfully! Mannum Maramum leadership will review and reach out.',
      partnershipId: result.id
    });
  } catch (error) {
    console.error('Partnership submission error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/partnerships/:id (Protected - Update status and internal staff notes)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const partnershipId = req.params.id;
    const existing = await get('SELECT * FROM partnerships WHERE id = ?', [partnershipId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Partnership submission not found.' });
    }

    const { status, internal_notes } = req.body;

    await run(
      `UPDATE partnerships SET
        status = ?,
        internal_notes = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        status !== undefined ? status : existing.status,
        internal_notes !== undefined ? internal_notes : existing.internal_notes,
        partnershipId
      ]
    );

    await run(
      `INSERT INTO activity_logs (user_id, username, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, req.user.username, 'UPDATE_PARTNERSHIP', 'PARTNERSHIP', partnershipId, `Status updated to ${status}`]
    );

    return res.json({ success: true, message: 'Partnership status updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/partnerships/:id (Protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await run('DELETE FROM partnerships WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Partnership submission deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
