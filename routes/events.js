const express = require('express');
const router = express.Router();
const { run, get, all } = require('../data/database');
const { authenticateToken } = require('../middleware/auth');

const jwt = require('jsonwebtoken');

function checkIsAdmin(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mannum_maramum_secret_jwt_key_2025');
    return !!decoded;
  } catch (e) {
    return false;
  }
}

// GET /api/events (Public visitors only see published events)
router.get('/', async (req, res) => {
  try {
    const { status, publishedOnly, search } = req.query;
    let sql = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    const isAdmin = checkIsAdmin(req);

    if (!isAdmin) {
      sql += ' AND is_published = 1';
    } else if (publishedOnly === 'true' || publishedOnly === '1') {
      sql += ' AND is_published = 1';
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (title_en LIKE ? OR title_ta LIKE ? OR location LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY event_date ASC, id DESC';
    const events = await all(sql, params);

    return res.json({ success: true, events });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const event = await get('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    return res.json({ success: true, event });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/events (Protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title_en,
      title_ta,
      event_date,
      location,
      description_en,
      description_ta,
      status = 'upcoming',
      cover_image = '',
      is_published = 1,
      target_participants = 0
    } = req.body;

    if (!title_en || !event_date || !location || !description_en) {
      return res.status(400).json({
        success: false,
        message: 'Event title, date, location, and description are required.'
      });
    }

    const result = await run(
      `INSERT INTO events (
        title_en, title_ta, event_date, location, description_en, description_ta,
        status, cover_image, is_published, target_participants, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        title_en.trim(),
        title_ta ? title_ta.trim() : title_en.trim(),
        event_date,
        location.trim(),
        description_en.trim(),
        description_ta ? description_ta.trim() : description_en.trim(),
        status,
        cover_image,
        is_published ? 1 : 0,
        parseInt(target_participants, 10) || 0
      ]
    );

    await run(
      `INSERT INTO activity_logs (user_id, username, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, req.user.username, 'CREATE_EVENT', 'EVENT', result.id, `Created event: "${title_en}"`]
    );

    return res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      eventId: result.id
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/events/:id (Protected)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    const existing = await get('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const {
      title_en,
      title_ta,
      event_date,
      location,
      description_en,
      description_ta,
      status,
      cover_image,
      is_published,
      target_participants,
      registered_participants
    } = req.body;

    await run(
      `UPDATE events SET
        title_en = ?,
        title_ta = ?,
        event_date = ?,
        location = ?,
        description_en = ?,
        description_ta = ?,
        status = ?,
        cover_image = ?,
        is_published = ?,
        target_participants = ?,
        registered_participants = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title_en !== undefined ? title_en : existing.title_en,
        title_ta !== undefined ? title_ta : existing.title_ta,
        event_date !== undefined ? event_date : existing.event_date,
        location !== undefined ? location : existing.location,
        description_en !== undefined ? description_en : existing.description_en,
        description_ta !== undefined ? description_ta : existing.description_ta,
        status !== undefined ? status : existing.status,
        cover_image !== undefined ? cover_image : existing.cover_image,
        is_published !== undefined ? (is_published ? 1 : 0) : existing.is_published,
        target_participants !== undefined ? parseInt(target_participants, 10) : existing.target_participants,
        registered_participants !== undefined ? parseInt(registered_participants, 10) : existing.registered_participants,
        eventId
      ]
    );

    await run(
      `INSERT INTO activity_logs (user_id, username, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, req.user.username, 'UPDATE_EVENT', 'EVENT', eventId, `Updated event ID ${eventId}`]
    );

    return res.json({ success: true, message: 'Event updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/events/:id (Protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await get('SELECT title_en FROM events WHERE id = ?', [req.params.id]);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    await run('DELETE FROM events WHERE id = ?', [req.params.id]);

    await run(
      `INSERT INTO activity_logs (user_id, username, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, req.user.username, 'DELETE_EVENT', 'EVENT', req.params.id, `Deleted event: "${event.title_en}"`]
    );

    return res.json({ success: true, message: 'Event deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/events/:id/publish (Protected)
router.patch('/:id/publish', authenticateToken, async (req, res) => {
  try {
    const { is_published } = req.body;
    const pubVal = (is_published === true || is_published === 1 || is_published === '1') ? 1 : 0;
    await run('UPDATE events SET is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [pubVal, req.params.id]);
    return res.json({ success: true, message: `Event ${pubVal ? 'published' : 'unpublished'} successfully.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
