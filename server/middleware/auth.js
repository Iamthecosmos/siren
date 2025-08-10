const jwt = require('jsonwebtoken');
const { getQuery } = require('../database/init');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'Please provide a valid authentication token'
    });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      });
    }

    try {
      // Verify user still exists and is active
      const user = await getQuery(
        'SELECT id, uuid, username, email, full_name, is_verified, is_admin FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (!user) {
        return res.status(403).json({ 
          error: 'User not found',
          message: 'The user associated with this token no longer exists'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({ 
        error: 'Authentication error',
        message: 'An error occurred during authentication'
      });
    }
  });
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      req.user = null;
      return next();
    }

    try {
      const user = await getQuery(
        'SELECT id, uuid, username, email, full_name, is_verified, is_admin FROM users WHERE id = ?',
        [decoded.userId]
      );

      req.user = user || null;
      next();
    } catch (error) {
      req.user = null;
      next();
    }
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({
      error: 'Admin access required',
      message: 'This endpoint requires administrator privileges'
    });
  }
  next();
}

function requireVerified(req, res, next) {
  if (!req.user || !req.user.is_verified) {
    return res.status(403).json({
      error: 'Verified account required',
      message: 'This action requires a verified account'
    });
  }
  next();
}

function generateToken(userId) {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  requireVerified,
  generateToken,
  verifyToken
};
