const jwt = require('jsonwebtoken');
const { get } = require('../data/database');
require('dotenv').config();

// Centralized JWT Secret resolution
function resolveJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL CONFIGURATION ERROR: JWT_SECRET environment variable must be set in production mode.');
    }
    // Consistent development fallback
    return 'mannum_maramum_iyakkam_secure_jwt_token_key_2026_xyz987';
  }
  return secret;
}

const JWT_SECRET = resolveJwtSecret();

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token required.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Verify user still exists in database and is active
    const user = await get('SELECT id, username, email, name, role, status FROM users WHERE id = ?', [decoded.id]);
    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Invalid session or user account deactivated.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid, expired, or tampered token. Please log in again.'
    });
  }
};

// Middleware for role-based authorization
const requireRole = (allowedRoles = ['super_admin', 'admin']) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (Array.isArray(allowedRoles) && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. You do not have adequate privileges for this action.'
      });
    }

    next();
  };
};

// Helper to safely check if a request has a valid admin/authenticated JWT token
function checkIsAdmin(req) {
  const authHeader = req.headers['authorization'] || req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) return false;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return !!decoded;
  } catch (e) {
    return false;
  }
}

module.exports = {
  authenticateToken,
  requireRole,
  JWT_SECRET,
  checkIsAdmin
};
