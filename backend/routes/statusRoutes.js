const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   GET /api/status/:complaint_id
// @desc    Get status history for a complaint
// @access  Public (or Private depending on design)
router.get('/:complaint_id', async (req, res) => {
  try {
    const logs = await db.query(
      'SELECT * FROM status_logs WHERE complaint_id = $1 ORDER BY timestamp DESC',
      [req.params.complaint_id]
    );

    res.json(logs.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
