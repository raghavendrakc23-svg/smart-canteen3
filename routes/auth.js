// routes/auth.js — Login endpoint → returns a signed JWT
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

/**
 * POST /api/auth/login
 * Body: { username, password }
 * Returns: { token, user: { id, username, role } }
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  let lookupUsername = username.trim();
  if (lookupUsername === 'admin@smartcanteen.local') lookupUsername = 'admin';
  if (lookupUsername === 'staff@smartcanteen.local') lookupUsername = 'staff';

  const user = db.prepare('SELECT * FROM users WHERE username = ? OR username = ?').get(username.trim(), lookupUsername);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

module.exports = router;
