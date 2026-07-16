const jwt = require('jsonwebtoken');

function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No admin token provided' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No admin token provided' });
  }
  try {
    const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    // Attach admin info to request
    req.admin = { role: payload.role || 'administrator' };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid admin token' });
  }
}

module.exports = adminAuth;

