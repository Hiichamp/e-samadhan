const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   GET /api/dashboard/stats
// @desc    Get public transparency dashboard statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    // 1. Total complaints filed
    const totalResult = await db.query(`SELECT COUNT(*) as count FROM complaints`);
    const totalComplaints = parseInt(totalResult.rows[0].count) || 0;

    // 2. Resolved complaints for resolution rate
    const resolvedResult = await db.query(`SELECT COUNT(*) as count FROM complaints WHERE status = 'resolved'`);
    const resolvedComplaints = parseInt(resolvedResult.rows[0].count) || 0;
    const overallResolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0;

    // 3. Departments Count
    const deptCountResult = await db.query(`SELECT COUNT(*) as count FROM departments`);
    const totalDepartments = parseInt(deptCountResult.rows[0].count) || 0;

    // 4. Avg Resolution Time (in days)
    const avgTimeResult = await db.query(`
      SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400) as avg_days 
      FROM complaints 
      WHERE status = 'resolved'
    `);
    const avgResolutionDays = avgTimeResult.rows[0].avg_days ? parseFloat(avgTimeResult.rows[0].avg_days).toFixed(1) : 0;

    // 5. Department-wise Resolution Rate (Real Data)
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

    // 6. Avg Resolution Time by Category
    const catTimeResult = await db.query(`
      SELECT 
        category,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400) as avg_days
      FROM complaints
      WHERE status = 'resolved'
      GROUP BY category
      ORDER BY avg_days DESC
      LIMIT 6
    `);
    const avgResolutionTime = catTimeResult.rows.map(row => ({
      category: row.category,
      days: parseFloat(row.avg_days).toFixed(1)
    }));

    // 7. Trend Data (Last 6 months)
    const trendResult = await db.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon') as month,
        EXTRACT(MONTH FROM created_at) as month_num,
        COUNT(id) as filed,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
      FROM complaints
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY month, month_num
      ORDER BY month_num ASC
    `);
    const trendData = trendResult.rows.map(row => ({
      month: row.month,
      filed: parseInt(row.filed),
      resolved: parseInt(row.resolved)
    }));

    res.json({
      totalComplaints,
      overallResolutionRate,
      totalDepartments,
      avgResolutionDays,
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
