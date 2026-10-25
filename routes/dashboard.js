const express = require('express');
const router = express.Router();
const { get, all } = require('../data/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/dashboard/summary - Protected
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const totalProjects = await get('SELECT COUNT(*) as count FROM projects');
    const publishedProjects = await get('SELECT COUNT(*) as count FROM projects WHERE status = "published"');
    const totalEvents = await get('SELECT COUNT(*) as count FROM events');
    const upcomingEvents = await get('SELECT COUNT(*) as count FROM events WHERE status = "upcoming"');
    const totalGallery = await get('SELECT COUNT(*) as count FROM gallery');
    const totalVolunteers = await get('SELECT COUNT(*) as count FROM volunteers');
    const pendingVolunteers = await get('SELECT COUNT(*) as count FROM volunteers WHERE status = "Pending"');
    const totalPartnerships = await get('SELECT COUNT(*) as count FROM partnerships');
    const pendingPartnerships = await get('SELECT COUNT(*) as count FROM partnerships WHERE status = "Pending"');
    const donationStats = await get('SELECT COUNT(*) as count, SUM(amount) as totalAmount FROM donations');

    // Recent items
    const recentProjects = await all('SELECT id, title_en, category, project_date, status, cover_image FROM projects ORDER BY id DESC LIMIT 5');
    const recentVolunteers = await all('SELECT id, name, email, phone, status, created_at FROM volunteers ORDER BY id DESC LIMIT 5');
    const recentPartnerships = await all('SELECT id, org_name, org_type, contact_name, status, created_at FROM partnerships ORDER BY id DESC LIMIT 5');
    const recentActivities = await all('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 10');

    // Verified impact totals
    const impact = await get('SELECT * FROM impact_stats WHERE id = 1');

    return res.json({
      success: true,
      summary: {
        totalProjects: totalProjects.count,
        publishedProjects: publishedProjects.count,
        totalEvents: totalEvents.count,
        upcomingEvents: upcomingEvents.count,
        totalGalleryPhotos: totalGallery.count,
        totalVolunteers: totalVolunteers.count,
        pendingVolunteers: pendingVolunteers.count,
        totalPartnerships: totalPartnerships.count,
        pendingPartnerships: pendingPartnerships.count,
        totalDonationsCount: donationStats.count || 0,
        totalDonationsAmount: donationStats.totalAmount || 0,
        palmSeedsPlanted: impact ? impact.palm_seeds_planted : 50000,
        treesPlanted: impact ? impact.trees_planted : 5000
      },
      recentProjects,
      recentVolunteers,
      recentPartnerships,
      recentActivities
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
