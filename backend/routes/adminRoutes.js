const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../db');
// We could add an admin auth middleware later

// @route   PUT /api/admin/complaints/:id/status
// @desc    Update complaint status
// @access  Admin/Private
router.put(
  '/complaints/:id/status',
  [
    body('status', 'Status is required').isIn(['filed', 'verified', 'in_progress', 'resolved']),
    body('note', 'Note is optional but should be a string').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, note, updated_by } = req.body;
    const complaintId = req.params.id;

    try {
      // Get old status
      const oldComplaintResult = await db.query('SELECT status FROM complaints WHERE id = $1', [complaintId]);
      
      if (oldComplaintResult.rows.length === 0) {
        return res.status(404).json({ msg: 'Complaint not found' });
      }

      const oldStatus = oldComplaintResult.rows[0].status;

      // Update complaint status
      await db.query(
        'UPDATE complaints SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [status, complaintId]
      );

      // Log the change
      await db.query(
        'INSERT INTO status_logs (complaint_id, old_status, new_status, updated_by, note) VALUES ($1, $2, $3, $4, $5)',
        [complaintId, oldStatus, status, updated_by || null, note || '']
      );

      res.json({ msg: 'Status updated successfully', new_status: status });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
