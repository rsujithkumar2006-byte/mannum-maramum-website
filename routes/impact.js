const express = require('express');
const router = express.Router();
const { run, get } = require('../data/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/impact (Public)
router.get('/', async (req, res) => {
  try {
    const stats = await get('SELECT * FROM impact_stats WHERE id = 1');
    const volRow = await get(`
      SELECT COUNT(DISTINCT LOWER(TRIM(email))) as count
      FROM volunteers
      WHERE status IN ('Approved', 'Active')
        AND LOWER(name) NOT LIKE '%test%'
        AND LOWER(email) NOT LIKE '%test%'
        AND (notes IS NULL OR LOWER(notes) NOT LIKE '%test%')
    `);
    const verifiedVolunteers = (volRow && typeof volRow.count === 'number') ? volRow.count : 0;
    return res.json({
      success: true,
      impact: {
        ...stats,
        verified_volunteers_count: verifiedVolunteers
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/impact (Protected)
router.put('/', authenticateToken, async (req, res) => {
  try {
    const {
      palm_seeds_planted,
      trees_planted,
      projects_completed,
      events_conducted,
      locations_covered,
      volunteers_participated,
      active_since,
      is_verified = 1
    } = req.body;

    await run(
      `UPDATE impact_stats SET
        palm_seeds_planted = ?,
        trees_planted = ?,
        projects_completed = ?,
        events_conducted = ?,
        locations_covered = ?,
        volunteers_participated = ?,
        active_since = ?,
        is_verified = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`,
      [
        parseInt(palm_seeds_planted, 10) || 0,
        parseInt(trees_planted, 10) || 0,
        parseInt(projects_completed, 10) || 0,
        parseInt(events_conducted, 10) || 0,
        parseInt(locations_covered, 10) || 0,
        parseInt(volunteers_participated, 10) || 0,
        parseInt(active_since, 10) || 2024,
        is_verified ? 1 : 0
      ]
    );

    await run(
      `INSERT INTO activity_logs (user_id, username, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, req.user.username, 'UPDATE_IMPACT', 'IMPACT', 1, 'Updated verified environmental impact totals']
    );

    return res.json({
      success: true,
      message: 'Verified environmental impact metrics updated successfully.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
