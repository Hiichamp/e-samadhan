const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const db = require('../db');
const { generateRef } = require('../utils/generateRef');

// @route   POST /api/complaints
// @desc    Register a new complaint
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      body('type', 'Type must be civic or legal').isIn(['civic', 'legal']),
      body('category', 'Category is required').not().isEmpty(),
      body('description', 'Description is required').not().isEmpty(),
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, category, subcategory, description, location_lat, location_lng, address_text, cognizable } = req.body;
    const user_id = req.user.id;
    const reference_number = generateRef();

    try {
      const newComplaint = await db.query(
        `INSERT INTO complaints 
        (reference_number, user_id, type, category, subcategory, description, location_lat, location_lng, address_text, cognizable) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [reference_number, user_id, type, category, subcategory, description, location_lat, location_lng, address_text, cognizable]
      );

      // Log the initial status
      await db.query(
        `INSERT INTO status_logs (complaint_id, new_status, note) VALUES ($1, $2, $3)`,
        [newComplaint.rows[0].id, 'filed', 'Complaint filed by user']
      );

      res.json(newComplaint.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET /api/complaints
// @desc    Get all complaints for logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const complaints = await db.query(
      'SELECT * FROM complaints WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(complaints.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/complaints/:ref
// @desc    Get complaint by reference number
// @access  Public (or Private depending on requirements, making it Public for easy tracking if user knows ref)
router.get('/:ref', async (req, res) => {
  try {
    const complaint = await db.query(
      'SELECT * FROM complaints WHERE reference_number = $1',
      [req.params.ref]
    );

    if (complaint.rows.length === 0) {
      return res.status(404).json({ msg: 'Complaint not found' });
    }

    res.json(complaint.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
