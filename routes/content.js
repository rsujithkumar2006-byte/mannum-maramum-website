const express = require('express');
const router = express.Router();
const { run, get, all } = require('../data/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/content (Public - returns dictionary)
router.get('/', async (req, res) => {
  try {
    const list = await all('SELECT * FROM site_content ORDER BY section, key ASC');
    const dict = {};
    list.forEach(item => {
      dict[item.key] = {
        en: item.content_en,
        ta: item.content_ta || item.content_en,
        section: item.section,
        description: item.description,
        updated_at: item.updated_at
      };
    });
    return res.json({ success: true, content: dict, list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/content/:key (Protected)
router.put('/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    const { content_en, content_ta, section, description } = req.body;

    const existing = await get('SELECT * FROM site_content WHERE key = ?', [key]);

    if (existing) {
      await run(
        `UPDATE site_content SET
          content_en = ?,
          content_ta = ?,
          section = COALESCE(?, section),
          description = COALESCE(?, description),
          updated_at = CURRENT_TIMESTAMP
         WHERE key = ?`,
        [
          content_en !== undefined ? content_en : existing.content_en,
          content_ta !== undefined ? content_ta : existing.content_ta,
          section,
          description,
          key
        ]
      );
    } else {
      await run(
        `INSERT INTO site_content (key, section, content_en, content_ta, description)
         VALUES (?, ?, ?, ?, ?)`,
        [key, section || 'General', content_en || '', content_ta || '', description || '']
      );
    }

    await run(
      `INSERT INTO activity_logs (user_id, username, action, entity_type, details)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, req.user.username, 'UPDATE_CONTENT', 'CONTENT', `Updated website text for key: ${key}`]
    );

    return res.json({ success: true, message: `Content block '${key}' updated successfully.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
