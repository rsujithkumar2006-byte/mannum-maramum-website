const express = require('express');
const router = express.Router();
const { run, get, all } = require('../data/database');
const { authenticateToken, checkIsAdmin } = require('../middleware/auth');

// GET /api/projects - Public & Admin with filters
router.get('/', async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 50 } = req.query;
    let sql = 'SELECT * FROM projects WHERE 1=1';
    const params = [];

    const isAdmin = checkIsAdmin(req);

    // Enforce publication security: Public visitors can ONLY see published projects
    if (!isAdmin) {
      sql += " AND status = 'published'";
    } else if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (title_en LIKE ? OR title_ta LIKE ? OR location LIKE ? OR participating_orgs LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY project_date DESC, id DESC';

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit, 10), offset);

    const projects = await all(sql, params);

    // Parse JSON fields
    const parsed = projects.map(p => ({
      ...p,
      gallery_images: p.gallery_images ? JSON.parse(p.gallery_images) : [],
      key_highlights: p.key_highlights ? JSON.parse(p.key_highlights) : []
    }));

    const totalCount = await get(
      isAdmin ? 'SELECT COUNT(*) as count FROM projects' : "SELECT COUNT(*) as count FROM projects WHERE status = 'published'"
    );

    return res.json({
      success: true,
      projects: parsed,
      total: totalCount.count
    });
  } catch (error) {
    console.error('Fetch projects error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const project = await get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.gallery_images = project.gallery_images ? JSON.parse(project.gallery_images) : [];
    project.key_highlights = project.key_highlights ? JSON.parse(project.key_highlights) : [];

    return res.json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/projects (Protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title_en,
      title_ta,
      description_en,
      description_ta,
      location,
      project_date,
      category,
      status = 'published',
      palm_seeds_planted = 0,
      saplings_planted = 0,
      participating_orgs = '',
      supporting_orgs = '',
      cover_image = '',
      gallery_images = [],
      key_highlights = [],
      is_featured = 0
    } = req.body;

    if (!title_en || !description_en || !location || !project_date || !category) {
      return res.status(400).json({
        success: false,
        message: 'Project title, description, location, date, and category are required.'
      });
    }

    const galJson = Array.isArray(gallery_images) ? JSON.stringify(gallery_images) : (typeof gallery_images === 'string' ? gallery_images : '[]');
    const highJson = Array.isArray(key_highlights) ? JSON.stringify(key_highlights) : (typeof key_highlights === 'string' ? key_highlights : '[]');

    const result = await run(
      `INSERT INTO projects (
        title_en, title_ta, description_en, description_ta, location, project_date, category, status,
        palm_seeds_planted, saplings_planted, participating_orgs, supporting_orgs, cover_image,
        gallery_images, key_highlights, is_featured, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        title_en.trim(),
        title_ta ? title_ta.trim() : title_en.trim(),
        description_en.trim(),
        description_ta ? description_ta.trim() : description_en.trim(),
        location.trim(),
        project_date,
        category,
        status,
        parseInt(palm_seeds_planted, 10) || 0,
        parseInt(saplings_planted, 10) || 0,
        participating_orgs,
        supporting_orgs,
        cover_image,
        galJson,
        highJson,
        is_featured ? 1 : 0
      ]
    );

    await run(
      `INSERT INTO activity_logs (user_id, username, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, req.user.username, 'CREATE_PROJECT', 'PROJECT', result.id, `Created project: "${title_en}"`]
    );

    return res.status(201).json({
      success: true,
      message: 'Environmental project created successfully.',
      projectId: result.id
    });
  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/projects/:id (Protected)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    const existing = await get('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const {
      title_en,
      title_ta,
      description_en,
      description_ta,
      location,
      project_date,
      category,
      status,
      palm_seeds_planted,
      saplings_planted,
      participating_orgs,
      supporting_orgs,
      cover_image,
      gallery_images,
      key_highlights,
      is_featured
    } = req.body;

    const galJson = gallery_images !== undefined ? (Array.isArray(gallery_images) ? JSON.stringify(gallery_images) : gallery_images) : existing.gallery_images;
    const highJson = key_highlights !== undefined ? (Array.isArray(key_highlights) ? JSON.stringify(key_highlights) : key_highlights) : existing.key_highlights;

    await run(
      `UPDATE projects SET
        title_en = ?,
        title_ta = ?,
        description_en = ?,
        description_ta = ?,
        location = ?,
        project_date = ?,
        category = ?,
        status = ?,
        palm_seeds_planted = ?,
        saplings_planted = ?,
        participating_orgs = ?,
        supporting_orgs = ?,
        cover_image = ?,
        gallery_images = ?,
        key_highlights = ?,
        is_featured = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title_en !== undefined ? title_en : existing.title_en,
        title_ta !== undefined ? title_ta : existing.title_ta,
        description_en !== undefined ? description_en : existing.description_en,
        description_ta !== undefined ? description_ta : existing.description_ta,
        location !== undefined ? location : existing.location,
        project_date !== undefined ? project_date : existing.project_date,
        category !== undefined ? category : existing.category,
        status !== undefined ? status : existing.status,
        palm_seeds_planted !== undefined ? parseInt(palm_seeds_planted, 10) : existing.palm_seeds_planted,
        saplings_planted !== undefined ? parseInt(saplings_planted, 10) : existing.saplings_planted,
        participating_orgs !== undefined ? participating_orgs : existing.participating_orgs,
        supporting_orgs !== undefined ? supporting_orgs : existing.supporting_orgs,
        cover_image !== undefined ? cover_image : existing.cover_image,
        galJson,
        highJson,
        is_featured !== undefined ? (is_featured ? 1 : 0) : existing.is_featured,
        projectId
      ]
    );

    await run(
      `INSERT INTO activity_logs (user_id, username, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, req.user.username, 'UPDATE_PROJECT', 'PROJECT', projectId, `Updated project ID ${projectId}`]
    );

    return res.json({ success: true, message: 'Project updated successfully.' });
  } catch (error) {
    console.error('Update project error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/projects/:id/publish (Protected)
router.patch('/:id/publish', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body; // 'published' or 'draft'
    if (!status || !['published', 'draft', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    await run('UPDATE projects SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, req.params.id]);

    await run(
      `INSERT INTO activity_logs (user_id, username, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, req.user.username, 'TOGGLE_PROJECT_STATUS', 'PROJECT', req.params.id, `Changed status to: ${status}`]
    );

    return res.json({ success: true, message: `Project status changed to ${status}.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/projects/:id (Protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await get('SELECT title_en FROM projects WHERE id = ?', [req.params.id]);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    await run('DELETE FROM projects WHERE id = ?', [req.params.id]);

    await run(
      `INSERT INTO activity_logs (user_id, username, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, req.user.username, 'DELETE_PROJECT', 'PROJECT', req.params.id, `Deleted project: "${project.title_en}"`]
    );

    return res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
