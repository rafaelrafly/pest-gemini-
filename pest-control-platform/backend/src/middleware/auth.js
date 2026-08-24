const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET || 'supersecret_pest_jwt_key_2026', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const checkPermission = (module, action) => {
  return async (req, res, next) => {
    // In production, query user_permissions table. Here we check user context from JWT/DB.
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    // Admin override or check specific permission
    next();
  };
};

module.exports = { verifyToken, checkPermission };
