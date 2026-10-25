const express = require('express');
const router = express.Router();
const { run, get, all } = require('../data/database');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

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

// GET /api/gallery (Public & Admin)
router.get('/', async (req, res) => {
  try {
    const { category, projectId, eventId, publishedOnly } = req.query;
    let sql = `
      SELECT g.*, p.title_en as project_title, e.title_en as event_title
      FROM gallery g
      LEFT JOIN projects p ON g.project_id = p.id
      LEFT JOIN events e ON g.event_id = e.id
      WHERE 1=1
    `;
    const params = [];

    const isAdmin = checkIsAdmin(req);

    if (!isAdmin) {
      sql += ' AND g.is_published = 1';
    } else if (publishedOnly === 'true' || publishedOnly === '1') {
      sql += ' AND g.is_published = 1';
    }

    if (category) {
      sql += ' AND g.category = ?';
      params.push(category);
    }

    if (projectId) {
      sql += ' AND g.project_id = ?';
      params.push(projectId);
    }

    if (eventId) {
      sql += ' AND g.event_id = ?';
      params.push(eventId);
    }

    sql += ' ORDER BY g.order_index ASC, g.id DESC';
    const items = await all(sql, params);

    return res.json({ success: true, gallery: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/gallery (Protected - Supports single or multiple file uploads)
router.post('/', authenticateToken, upload.array('images', 15), async (req, res) => {
  try {
    const {
      title_en,
      title_ta,
      caption_en,
      caption_ta,
      category = 'general',
      project_id,
      event_id,
      is_published = 1,
      image_urls // For manual URL or base64 additions
    } = req.body;

    const files = req.files || [];
    let urlsToInsert = [];

    if (files.length > 0) {
      urlsToInsert = files.map(f => `/uploads/gallery/${f.filename}`);
    } else if (image_urls) {
      urlsToInsert = Array.isArray(image_urls) ? image_urls : [image_urls];
    } else if (req.body.image_url) {
      urlsToInsert = [req.body.image_url];
    }

    if (urlsToInsert.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided. Please upload at least one image or provide an image URL.'
      });
    }

    const insertedIds = [];
    for (let i = 0; i < urlsToInsert.length; i++) {
      const url = urlsToInsert[i];
      const result = await run(
        `INSERT INTO gallery (
          title_en, title_ta, caption_en, caption_ta, image_url, project_id, event_id,
          category, is_published, order_index
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title_en ? title_en.trim() : `Gallery Photo ${Date.now()}`,
          title_ta ? title_ta.trim() : (title_en || ''),
          caption_en ? caption_en.trim() : (title_en || 'Mannum Maramum fieldwork'),
          caption_ta ? caption_ta.trim() : (title_ta || caption_en || ''),
          url,
          project_id ? parseInt(project_id, 10) : null,
          event_id ? parseInt(event_id, 10) : null,
          category,
          is_published ? 1 : 0,
          i
        ]
      );
      insertedIds.push(result.id);
    }

    await run(
      `INSERT INTO activity_logs (user_id, username, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, req.user.username, 'UPLOAD_GALLERY', 'GALLERY', insertedIds[0], `Uploaded ${urlsToInsert.length} gallery image(s)`]
    );

    return res.status(201).json({
      success: true,
      message: `Successfully uploaded and registered ${urlsToInsert.length} gallery photo(s).`,
      ids: insertedIds
    });
  } catch (error) {
    console.error('Gallery upload error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/gallery/:id (Protected - Edit captions, title, project/event link)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const galleryId = req.params.id;
    const existing = await get('SELECT * FROM gallery WHERE id = ?', [galleryId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Gallery item not found.' });
    }

    const {
      title_en,
      title_ta,
      caption_en,
      caption_ta,
      category,
      project_id,
      event_id,
      is_published,
      order_index
    } = req.body;

    await run(
      `UPDATE gallery SET
        title_en = ?,
        title_ta = ?,
        caption_en = ?,
        caption_ta = ?,
        category = ?,
        project_id = ?,
        event_id = ?,
        is_published = ?,
        order_index = ?
       WHERE id = ?`,
      [
        title_en !== undefined ? title_en : existing.title_en,
        title_ta !== undefined ? title_ta : existing.title_ta,
        caption_en !== undefined ? caption_en : existing.caption_en,
        caption_ta !== undefined ? caption_ta : existing.caption_ta,
        category !== undefined ? category : existing.category,
        project_id !== undefined ? (project_id ? parseInt(project_id, 10) : null) : existing.project_id,
        event_id !== undefined ? (event_id ? parseInt(event_id, 10) : null) : existing.event_id,
        is_published !== undefined ? (is_published ? 1 : 0) : existing.is_published,
        order_index !== undefined ? parseInt(order_index, 10) : existing.order_index,
        galleryId
      ]
    );

    return res.json({ success: true, message: 'Gallery item updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/gallery/:id (Protected - Delete with confirmation)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await get('SELECT caption_en FROM gallery WHERE id = ?', [req.params.id]);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found.' });
    }

    await run('DELETE FROM gallery WHERE id = ?', [req.params.id]);

    await run(
      `INSERT INTO activity_logs (user_id, username, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, req.user.username, 'DELETE_GALLERY', 'GALLERY', req.params.id, `Deleted gallery item: "${item.caption_en}"`]
    );

    return res.json({ success: true, message: 'Gallery photo removed successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/gallery/:id/publish (Protected)
router.patch('/:id/publish', authenticateToken, async (req, res) => {
  try {
    const { is_published } = req.body;
    const pubVal = (is_published === true || is_published === 1 || is_published === '1') ? 1 : 0;
    await run('UPDATE gallery SET is_published = ? WHERE id = ?', [pubVal, req.params.id]);
    return res.json({ success: true, message: `Gallery photo ${pubVal ? 'published' : 'unpublished'} successfully.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
