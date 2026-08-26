const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   GET /api/status/:referenceNumber
// @desc    Get status history, details, and estimated timeline for a complaint by ref number
// @access  Public
router.get('/:referenceNumber', async (req, res) => {
  try {
    const { referenceNumber } = req.params;

    // 1. Fetch complaint and department info
    const complaintResult = await db.query(
      `SELECT c.*, d.name as department_name, d.contact as department_contact 
       FROM complaints c 
       LEFT JOIN departments d ON c.assigned_department = d.id 
       WHERE c.reference_number = $1`,
      [referenceNumber]
    );

    if (complaintResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Complaint not found' });
    }

    const complaint = complaintResult.rows[0];

    // 2. Fetch status logs
    const logsResult = await db.query(
      'SELECT * FROM status_logs WHERE complaint_id = $1 ORDER BY timestamp ASC',
      [complaint.id]
    );

    // 3. Mock logic for estimated resolution timeline based on category
    let estimatedDays = 7; // default
    switch (complaint.category) {
      case 'pothole': estimatedDays = 14; break;
      case 'streetlight': estimatedDays = 3; break;
      case 'garbage': estimatedDays = 2; break;
      case 'water': estimatedDays = 1; break;
      case 'theft': estimatedDays = 30; break;
      case 'assault': estimatedDays = 15; break;
      case 'lost_item': estimatedDays = 7; break;
    }

    // Calculate ETA based on created_at
    const createdDate = new Date(complaint.created_at);
    const estimatedResolutionDate = new Date(createdDate.getTime() + estimatedDays * 24 * 60 * 60 * 1000);

    res.json({
      complaint: {
        reference_number: complaint.reference_number,
        type: complaint.type,
        category: complaint.category,
        description: complaint.description,
        status: complaint.status,
        created_at: complaint.created_at,
        department_name: complaint.department_name,
        department_contact: complaint.department_contact
      },
      logs: logsResult.rows,
      estimated_resolution_date: estimatedResolutionDate,
      estimated_days: estimatedDays
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
