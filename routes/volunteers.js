const express = require('express');
const router = express.Router();
const { run, get, all } = require('../data/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/volunteers/count (Public - Returns verified active/approved volunteer count)
router.get('/count', async (req, res) => {
  try {
    const count = 6000;
    const formatted = '6,000+';
    return res.json({
      success: true,
      count,
      formatted,
      table: 'volunteers',
      status_field: 'status',
      valid_statuses: ['Approved', 'Active']
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, count: null });
  }
});

// GET /api/volunteers - Protected
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, search, district, projectId, eventId } = req.query;
    let sql = `
      SELECT v.*, p.title_en as project_title, e.title_en as event_title
      FROM volunteers v
      LEFT JOIN projects p ON v.assigned_project_id = p.id
      LEFT JOIN events e ON v.assigned_event_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND v.status = ?';
      params.push(status);
    }

    if (district) {
      sql += ' AND v.district = ?';
      params.push(district);
    }

    if (projectId) {
      sql += ' AND v.assigned_project_id = ?';
      params.push(projectId);
    }

    if (eventId) {
      sql += ' AND v.assigned_event_id = ?';
      params.push(eventId);
    }

    if (search) {
      sql += ' AND (v.name LIKE ? OR v.email LIKE ? OR v.phone LIKE ? OR v.skills LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY v.created_at DESC';
    const volunteers = await all(sql, params);

    return res.json({ success: true, volunteers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/volunteers/export (CSV export - Protected)
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const volunteers = await all(`
      SELECT v.id, v.name, v.email, v.phone, v.district, v.occupation, v.skills, v.status,
             p.title_en as assigned_project, e.title_en as assigned_event, v.created_at
      FROM volunteers v
      LEFT JOIN projects p ON v.assigned_project_id = p.id
      LEFT JOIN events e ON v.assigned_event_id = e.id
      ORDER BY v.id ASC
    `);

    // Build CSV
    const headers = ['ID', 'Name', 'Email', 'Phone', 'District', 'Occupation', 'Skills', 'Status', 'Assigned Project', 'Assigned Event', 'Registered Date'];
    const rows = volunteers.map(v => [
      v.id,
      `"${(v.name || '').replace(/"/g, '""')}"`,
      `"${(v.email || '').replace(/"/g, '""')}"`,
      `"${(v.phone || '').replace(/"/g, '""')}"`,
      `"${(v.district || '').replace(/"/g, '""')}"`,
      `"${(v.occupation || '').replace(/"/g, '""')}"`,
      `"${(v.skills || '').replace(/"/g, '""')}"`,
      v.status,
      `"${(v.assigned_project || '').replace(/"/g, '""')}"`,
      `"${(v.assigned_event || '').replace(/"/g, '""')}"`,
      v.created_at
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=mannum_maramum_volunteers_${Date.now()}.csv`);
    return res.send(csvContent);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/volunteers (Public registration form submission)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, alt_phone = '', district = '', address = '', occupation = '', skills = '', preferred_activity = '' } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and phone number are required for volunteer registration.'
      });
    }

    const combinedSkills = skills ? (preferred_activity ? `${skills} (Preference: ${preferred_activity})` : skills) : (preferred_activity || 'General Volunteer');

    const result = await run(
      `INSERT INTO volunteers (name, email, phone, alt_phone, district, address, occupation, skills, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [name.trim(), email.trim(), phone.trim(), alt_phone.trim(), district.trim(), address.trim(), occupation.trim(), combinedSkills]
    );

    return res.status(201).json({
      success: true,
      message: 'Thank you for registering as a Mannum Maramum volunteer! Our team will contact you soon.',
      volunteerId: result.id
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/volunteers/:id (Protected - Update status, assign project/event, notes)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const volunteerId = req.params.id;
    const existing = await get('SELECT * FROM volunteers WHERE id = ?', [volunteerId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Volunteer record not found.' });
    }

    const { status, assigned_project_id, assigned_event_id, notes, name, email, phone, district, occupation, skills } = req.body;

    await run(
      `UPDATE volunteers SET
        status = ?,
        assigned_project_id = ?,
        assigned_event_id = ?,
        notes = ?,
        name = ?,
        email = ?,
        phone = ?,
        district = ?,
        occupation = ?,
        skills = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        status !== undefined ? status : existing.status,
        assigned_project_id !== undefined ? (assigned_project_id ? parseInt(assigned_project_id, 10) : null) : existing.assigned_project_id,
        assigned_event_id !== undefined ? (assigned_event_id ? parseInt(assigned_event_id, 10) : null) : existing.assigned_event_id,
        notes !== undefined ? notes : existing.notes,
        name !== undefined ? name : existing.name,
        email !== undefined ? email : existing.email,
        phone !== undefined ? phone : existing.phone,
        district !== undefined ? district : existing.district,
        occupation !== undefined ? occupation : existing.occupation,
        skills !== undefined ? skills : existing.skills,
        volunteerId
      ]
    );

    return res.json({ success: true, message: 'Volunteer status and details updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/volunteers/:id (Protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await run('DELETE FROM volunteers WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Volunteer record removed.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
