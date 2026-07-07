const userAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token || !token.startsWith('user_token_')) {
    return res.status(403).json({ error: 'Invalid user token' });
  }

  // Token format: user_token_[id]_[email]
  const parts = token.replace('user_token_', '').split('_');
  const userId = parts[0];
  const email = parts[1];

  if (!userId || !email) {
    return res.status(403).json({ error: 'Invalid user token format' });
  }

  req.user = {
    id: parseInt(userId),
    email: email
  };

  next();
};

module.exports = userAuth;
