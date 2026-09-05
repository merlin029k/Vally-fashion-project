/**
 * routes/auth.js
 * POST /api/auth/login — the only public auth endpoint.
 * Verifies email + password against the hashed password in the
 * database, and returns a signed JWT on success.
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../db');

const router = express.Router();

// Limit login attempts to slow down brute-force guessing
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/login', loginLimiter, (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email.toLowerCase().trim());

  // Deliberately vague error message — don't reveal whether the email exists
  if (!admin) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const passwordMatches = bcrypt.compareSync(password, admin.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  res.json({
    token,
    admin: { id: admin.id, email: admin.email }
  });
});

module.exports = router;
