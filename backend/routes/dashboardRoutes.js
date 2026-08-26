const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   GET /api/dashboard/stats
// @desc    Get public dashboard stats (department-wise resolution)
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        d.name as department_name,
        d.type as department_type,
        COUNT(c.id) as total_complaints,
        SUM(CASE WHEN c.status = 'resolved' THEN 1 ELSE 0 END) as resolved_complaints
      FROM complaints c
      LEFT JOIN departments d ON c.assigned_department = d.id
      GROUP BY d.name, d.type
    `;
    
    const stats = await db.query(statsQuery);

    const overallQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
      FROM complaints
    `;
    const overall = await db.query(overallQuery);

    res.json({
      overall: overall.rows[0],
      department_stats: stats.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
