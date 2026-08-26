const jwt = require('jsonwebtoken');
const db = require('../db');

const adminAuth = async (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ success: false, msg: 'No token, authorization denied' });
  }

  try {
    const bearerToken = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET || 'secret');
    
    // Check role in DB
    const userResult = await db.query('SELECT role FROM users WHERE id = $1', [decoded.user.id]);
    
    if (userResult.rows.length === 0 || (userResult.rows[0].role !== 'admin' && userResult.rows[0].role !== 'officer')) {
      return res.status(403).json({ success: false, msg: 'Access denied. Officers/Admins only.' });
    }

    req.user = decoded.user;
    req.user.role = userResult.rows[0].role;
    next();
  } catch (err) {
    res.status(401).json({ success: false, msg: 'Token is not valid' });
  }
};

module.exports = adminAuth;
