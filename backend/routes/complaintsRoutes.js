const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const db = require('../db');
const { generateRef } = require('../utils/generateRef');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'dummy_key',
});

// @route   POST /api/complaints/voice-parse
// @desc    Parse spoken complaint via LLM
// @access  Private
router.post(
  '/voice-parse',
  [
    body('transcript', 'Transcript is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { transcript } = req.body;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: transcript,
        config: {
          systemInstruction: "You are extracting structured complaint data from a citizen's spoken complaint in Hindi or English. Return ONLY valid JSON with fields: type (civic or legal), category (pothole/streetlight/garbage/water/theft/assault/lost_item/other), description (cleaned up, 2-3 lines), urgency (low/medium/high), location_mentioned (any place name mentioned or null). Do not include any markdown formatting or text outside the JSON.",
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const jsonString = response.text;
      const parsedData = JSON.parse(jsonString);

      res.json(parsedData);
    } catch (err) {
      console.error(err.message);
      // For hackathon fallback if API key is invalid/dummy
      if (err.status === 401 || err.status === 403 || err.message.includes('API key') || err.message.includes('key')) {
        return res.json({
          type: 'civic',
          category: 'pothole',
          description: `[MOCK GEMINI] ${transcript}`,
          urgency: 'medium',
          location_mentioned: null
        });
      }
      res.status(500).send('LLM parsing error');
    }
  }
);

// @route   POST /api/complaints
// @desc    Register a new complaint
// @access  Private
router.post(
  '/',
  [
    [
      body('type', 'Type must be civic or legal').isIn(['civic', 'legal']),
      body('category', 'Category is required').not().isEmpty(),
      body('description', 'Description is required').not().isEmpty(),
      body('full_name', 'Name is required').not().isEmpty(),
      body('mobile', 'Mobile number is required').isLength({ min: 10, max: 10 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, category, subcategory, description, location_lat, location_lng, address_text, cognizable, full_name, mobile } = req.body;
    const reference_number = generateRef();

    try {
      // Find or create user based on mobile number
      let userRes = await db.query('SELECT id FROM users WHERE phone = $1', [mobile]);
      let user_id;
      if (userRes.rows.length > 0) {
        user_id = userRes.rows[0].id;
      } else {
        const insertUser = await db.query(
          'INSERT INTO users (name, phone, role) VALUES ($1, $2, $3) RETURNING id',
          [full_name, mobile, 'citizen']
        );
        user_id = insertUser.rows[0].id;
      }
      let assigned_department = null;
      let status = 'filed';

      if (type === 'civic') {
        // Mock auto-assign to department based on pincode/area
        // In a real app, you'd lookup `SELECT id FROM departments WHERE area_pincode = ? AND type = 'municipal'`
        // For hackathon, we'll try to find any municipal department
        const deptRes = await db.query("SELECT id FROM departments WHERE type = 'municipal' LIMIT 1");
        if (deptRes.rows.length > 0) {
          assigned_department = deptRes.rows[0].id;
        }
      } else if (type === 'legal') {
        if (cognizable === true) {
          // Flag for police verification queue
          // Optionally assign to a police department
          const deptRes = await db.query("SELECT id FROM departments WHERE type = 'police' LIMIT 1");
          if (deptRes.rows.length > 0) {
            assigned_department = deptRes.rows[0].id;
          }
          // Note: status remains 'filed', but it's queued for verification
        } else {
          // Non-cognizable, treated as instant e-complaint
        }
      }

      const newComplaint = await db.query(
        `INSERT INTO complaints 
        (reference_number, user_id, type, category, subcategory, description, location_lat, location_lng, address_text, cognizable, assigned_department, status) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [reference_number, user_id, type, category, subcategory, description, location_lat, location_lng, address_text, cognizable, assigned_department, status]
      );

      // Log the initial status
      let logNote = 'Complaint filed by user';
      if (type === 'legal' && cognizable) {
        logNote += ' (Flagged for Police Verification)';
      }

      await db.query(
        `INSERT INTO status_logs (complaint_id, new_status, note) VALUES ($1, $2, $3)`,
        [newComplaint.rows[0].id, status, logNote]
      );

      // Mock sending SMS/notification
      console.log(`[TWILIO MOCK SMS] Dear Citizen, your NagrikTrack complaint has been registered. Ref: ${reference_number}. Track it online.`);

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
