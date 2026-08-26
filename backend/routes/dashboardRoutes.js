const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   GET /api/dashboard/stats
// @desc    Get public transparency dashboard statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    // 1. Total complaints filed (last 30 days) - Real DB Query
    const totalResult = await db.query(`
      SELECT COUNT(*) as count 
      FROM complaints 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);
    const realTotal = parseInt(totalResult.rows[0].count);
    
    // For a hackathon demo, if there are less than 50 real complaints, base it on a larger mock pool
    const totalComplaints = realTotal > 50 ? realTotal : realTotal + 342;

    // 2. Department-wise Resolution Rate
    const deptResult = await db.query(`
      SELECT 
        d.name as department,
        COUNT(c.id) as total,
        SUM(CASE WHEN c.status = 'resolved' THEN 1 ELSE 0 END) as resolved
      FROM departments d
      LEFT JOIN complaints c ON c.assigned_department = d.id
      GROUP BY d.name
    `);
    
    let resolutionRates = deptResult.rows.map(row => ({
      department: row.department || 'Unassigned',
      rate: parseInt(row.total) === 0 ? 0 : Math.round((parseInt(row.resolved) / parseInt(row.total)) * 100),
      total: parseInt(row.total),
      pending: parseInt(row.total) - parseInt(row.resolved)
    })).filter(r => r.total > 0);

    // If DB has no significant data, use dummy data for visual impact on charts
    if (resolutionRates.length === 0) {
      resolutionRates = [
        { department: 'Water Supply', rate: 78, pending: 12, total: 54 },
        { department: 'Public Works (PWD)', rate: 45, pending: 89, total: 161 },
        { department: 'Sanitation', rate: 92, pending: 5, total: 62 },
        { department: 'Streetlights', rate: 64, pending: 34, total: 94 },
        { department: 'Local Police', rate: 81, pending: 20, total: 105 },
      ];
    }

    // 3. Average Resolution Time by Category (Mocked for dashboard)
    const avgResolutionTime = [
      { category: 'Water Supply', days: 2.4 },
      { category: 'Sanitation', days: 3.1 },
      { category: 'Streetlights', days: 5.5 },
      { category: 'Roads/Potholes', days: 14.2 },
      { category: 'Lost Items', days: 7.0 },
      { category: 'Minor Theft', days: 21.5 },
    ];

    // 4. Over Time Data for Line Chart (Mocked 6 months trend)
    const trendData = [
      { month: 'Mar', filed: 120, resolved: 95 },
      { month: 'Apr', filed: 150, resolved: 110 },
      { month: 'May', filed: 180, resolved: 160 },
      { month: 'Jun', filed: 210, resolved: 185 },
      { month: 'Jul', filed: 190, resolved: 175 },
      { month: 'Aug', filed: 240, resolved: Math.floor(realTotal * 0.7) + 120 },
    ];

    res.json({
      totalComplaints,
      resolutionRates,
      avgResolutionTime,
      trendData
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
