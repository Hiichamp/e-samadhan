const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const db = require('../db');

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post(
  '/register',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('phone', 'Please include a valid phone number').isLength({ min: 10, max: 15 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, aadhaar_hash } = req.body;

    try {
      // Check if user exists
      const userResult = await db.query('SELECT * FROM users WHERE phone = $1', [phone]);
      
      let user;
      if (userResult.rows.length > 0) {
        user = userResult.rows[0];
      } else {
        // Insert new user
        const newUserResult = await db.query(
          'INSERT INTO users (name, phone, aadhaar_hash) VALUES ($1, $2, $3) RETURNING *',
          [name, phone, aadhaar_hash]
        );
        user = newUserResult.rows[0];
      }

      // Return jsonwebtoken (OTP verification mock)
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '5h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token, user });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
