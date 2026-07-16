const jwt = require('jsonwebtoken');

const userAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(403).json({ error: 'Invalid user token' });
  }

  try {
    const payload = jwt.verify(token, process.env.USER_JWT_SECRET);
    req.user = {
      id: payload.sub,
      email: payload.email
    };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired user token' });
  }
};

module.exports = userAuth;
