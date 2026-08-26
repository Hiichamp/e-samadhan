const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const db = require('../db');

// In-memory store for OTPs (For Hackathon Demo)
// In production, use Redis or a database table with expiry
const otpStore = new Map();

// @route   POST /api/auth/send-otp
// @desc    Send OTP to a phone number (Mocked)
// @access  Public
router.post(
  '/send-otp',
  [
    body('phone', 'Please include a valid phone number').isLength({ min: 10, max: 15 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone } = req.body;

    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP with 5-minute expiry
      otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

      // Mock sending SMS via Twilio
      console.log(`[TWILIO MOCK] Sending OTP ${otp} to phone number ${phone}`);
      console.log(`[TWILIO MOCK] (Fallback for Judges: 123456 will always work)`);

      res.json({ success: true, msg: 'OTP sent successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and return JWT
// @access  Public
router.post(
  '/verify-otp',
  [
    body('phone', 'Please include a valid phone number').not().isEmpty(),
    body('otp', 'OTP is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, otp } = req.body;

    try {
      // Check if it's the fallback OTP for judges
      const isFallback = otp === '123456';
      
      if (!isFallback) {
        // Validate against in-memory store
        const record = otpStore.get(phone);
        if (!record) {
          return res.status(400).json({ success: false, msg: 'OTP not requested or expired' });
        }
        if (record.expiresAt < Date.now()) {
          otpStore.delete(phone);
          return res.status(400).json({ success: false, msg: 'OTP has expired' });
        }
        if (record.otp !== otp) {
          return res.status(400).json({ success: false, msg: 'Invalid OTP' });
        }
        
        // OTP matched, delete it so it can't be reused
        otpStore.delete(phone);
      }

      // Ensure user exists in database
      let userResult = await db.query('SELECT * FROM users WHERE phone = $1', [phone]);
      let user;

      if (userResult.rows.length > 0) {
        user = userResult.rows[0];
        // Mark as verified if not already
        if (!user.otp_verified) {
          await db.query('UPDATE users SET otp_verified = TRUE WHERE id = $1', [user.id]);
          user.otp_verified = true;
        }
      } else {
        // Create new user since this is a new phone number
        const newUserResult = await db.query(
          'INSERT INTO users (name, phone, otp_verified) VALUES ($1, $2, $3) RETURNING *',
          ['Nagrik User', phone, true]
        );
        user = newUserResult.rows[0];
      }

      // Generate JWT
      const payload = {
        user: { id: user.id }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '5h' },
        (err, token) => {
          if (err) throw err;
          res.json({ success: true, token, user });
        }
      );

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get logged in user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const userResult = await db.query(
      'SELECT id, name, phone, aadhaar_hash, otp_verified, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(userResult.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
