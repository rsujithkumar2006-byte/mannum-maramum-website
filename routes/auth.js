const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { run, get, all } = require('../data/database');
const { authenticateToken, requireRole, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username/email and password.'
      });
    }

    const trimmedInput = usernameOrEmail.trim().toLowerCase();
    const user = await get(
      `SELECT * FROM users WHERE (LOWER(username) = ? OR LOWER(email) = ?) AND status = 'active'`,
      [trimmedInput, trimmedInput]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your username/email and password.'
      });
    }

    let isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch && typeof password === 'string' && password.trim() !== password) {
      isMatch = await bcrypt.compare(password.trim(), user.password_hash);
    }
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your username/email and password.'
      });
    }

    // Update last login
    await run(`UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`, [user.id]);

    // Log activity
    await run(
      `INSERT INTO activity_logs (user_id, username, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user.id, user.username, 'LOGIN', 'AUTH', user.id, `User logged in from ${req.ip || 'local'}`]
    );

    // Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful. Welcome to Mannum Maramum Admin Panel.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        last_login: user.last_login
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred while processing your login.'
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.'
      });
    }

    const userWithHash = await get('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, userWithHash.password_hash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password provided is incorrect.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    await run(
      `INSERT INTO activity_logs (user_id, username, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, req.user.username, 'PASSWORD_CHANGE', 'AUTH', req.user.id, 'User successfully changed password']
    );

    return res.json({
      success: true,
      message: 'Password updated successfully.'
    });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update password.'
    });
  }
});

// GET /api/auth/users (Manage staff accounts - Super Admin only)
router.get('/users', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const users = await all(
      `SELECT id, username, email, name, role, status, created_at, last_login FROM users ORDER BY id ASC`
    );
    return res.json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/users (Add staff account)
router.post('/users', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const { username, email, password, name, role } = req.body;

    if (!username || !email || !password || !name) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const existing = await get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username or email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const result = await run(
      `INSERT INTO users (username, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)`,
      [username.trim(), email.trim().toLowerCase(), hash, name.trim(), role || 'admin']
    );

    return res.status(201).json({
      success: true,
      message: 'Staff account created successfully.',
      userId: result.id
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/auth/users/:id
router.delete('/users/:id', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (targetId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    await run('DELETE FROM users WHERE id = ?', [targetId]);
    return res.json({ success: true, message: 'Staff account deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;
