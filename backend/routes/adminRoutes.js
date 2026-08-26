const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../db');
const adminAuth = require('../middleware/adminAuth');

// @route   GET /api/admin/complaints
// @desc    List all complaints, optionally filter by department, sort by date/status
// @access  Admin/Officer
router.get('/complaints', adminAuth, async (req, res) => {
  try {
    const { department, status, sortField = 'created_at', sortOrder = 'DESC' } = req.query;

    let query = `
      SELECT c.*, u.name as citizen_name, u.phone as citizen_phone, d.name as department_name 
      FROM complaints c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN departments d ON c.assigned_department = d.id
      WHERE 1=1
    `;
    const params = [];

    if (department) {
      params.push(department);
      query += ` AND c.assigned_department = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND c.status = $${params.length}`;
    }

    // Protect against SQL injection for dynamic sorting
    const validSortFields = ['created_at', 'status', 'type'];
    const finalSortField = validSortFields.includes(sortField) ? sortField : 'created_at';
    const finalSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY c.${finalSortField} ${finalSortOrder}`;

    const complaints = await db.query(query, params);
    res.json(complaints.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/admin/complaints/:id/status
// @desc    Update complaint status and add note
// @access  Admin/Officer
router.put(
  '/complaints/:id/status',
  [
    adminAuth,
    [
      body('status', 'Status is required').isIn(['filed', 'verified', 'in_progress', 'resolved']),
      body('note', 'Note is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, note } = req.body;
    const complaintId = req.params.id;
    const updatedBy = req.user.id;

    try {
      const oldComplaintResult = await db.query(
        'SELECT status, reference_number, user_id FROM complaints WHERE id = $1', 
        [complaintId]
      );
      
      if (oldComplaintResult.rows.length === 0) {
        return res.status(404).json({ msg: 'Complaint not found' });
      }

      const { status: oldStatus, reference_number, user_id } = oldComplaintResult.rows[0];

      // Update complaint status
      await db.query(
        'UPDATE complaints SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [status, complaintId]
      );

      // Log the change
      await db.query(
        'INSERT INTO status_logs (complaint_id, old_status, new_status, updated_by, note) VALUES ($1, $2, $3, $4, $5)',
        [complaintId, oldStatus, status, updatedBy, note]
      );

      // Get user phone for SMS mock
      const userRes = await db.query('SELECT phone FROM users WHERE id = $1', [user_id]);
      if (userRes.rows.length > 0) {
        const phone = userRes.rows[0].phone;
        console.log(`[TWILIO MOCK SMS] To ${phone}: Status for Complaint ${reference_number} changed to ${status.toUpperCase()}. Note: ${note}`);
      }

      res.json({ msg: 'Status updated successfully', new_status: status });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
