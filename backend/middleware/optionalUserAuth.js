const jwt = require('jsonwebtoken');

// Attaches req.user if a VALID JWT is present, but never blocks the request
// if it's missing/invalid (used for guest-checkout endpoints that still want
// to associate an order with a logged-in user when possible).
// Unlike the old scheme, this never trusts an unsigned "user_token_<id>_..."
// string — only a real, signed JWT is accepted.
const optionalUserAuth = (req, res, next) => {
  req.user = null;
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  const token = authHeader.split(' ')[1];
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.USER_JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
  } catch (err) {
    // Invalid/expired token on a guest-allowed route: proceed as guest
    // rather than rejecting, but do NOT trust any user_id from it.
    req.user = null;
  }
  next();
};

module.exports = optionalUserAuth;