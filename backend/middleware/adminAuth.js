const jwt = require('jsonwebtoken');
const adminSecret = process.env.ADMIN_SECRET;

function adminAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No admin token provided' });
  }
  try {
    // Simple token verification – token is just the secret string for this demo
    if (token !== adminSecret) {
      throw new Error('Invalid admin token');
    }
    // attach admin info
    req.admin = { role: 'administrator' };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid admin credentials' });
  }
}

module.exports = adminAuth;

