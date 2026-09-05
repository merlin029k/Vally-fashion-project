/**
 * routes/inquiries.js
 * Public: POST /api/inquiries — customer submits an interest/question
 *         about a product (or a general inquiry if product_id is omitted).
 * Admin-only: GET /api/inquiries — view all leads
 *             PATCH /api/inquiries/:id — update status (new/contacted/closed)
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// ---------- Public: submit an inquiry ----------
router.post('/', inquiryLimiter, (req, res) => {
  const { product_id, name, email, phone = '', message } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  if (!email || !isValidEmail(email.trim())) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }
  if (!message || message.trim().length < 5) {
    return res.status(400).json({ error: 'Please include a short message.' });
  }

  let validatedProductId = null;
  if (product_id) {
    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(product_id);
    if (product) validatedProductId = product.id;
  }

  const result = db.prepare(`
    INSERT INTO inquiries (product_id, name, email, phone, message, status)
    VALUES (?, ?, ?, ?, ?, 'new')
  `).run(validatedProductId, name.trim(), email.trim(), phone.trim(), message.trim());

  res.status(201).json({ success: true, id: result.lastInsertRowid });
});

// ---------- Admin: list all inquiries ----------
router.get('/', requireAuth, (req, res) => {
  const { status } = req.query;

  let query = `
    SELECT inquiries.*, products.title AS product_title
    FROM inquiries
    LEFT JOIN products ON inquiries.product_id = products.id
  `;
  const params = [];

  if (status && ['new', 'contacted', 'closed'].includes(status)) {
    query += ' WHERE inquiries.status = ?';
    params.push(status);
  }

  query += ' ORDER BY inquiries.created_at DESC';

  const inquiries = db.prepare(query).all(...params);
  res.json({ inquiries });
});

// ---------- Admin: update inquiry status ----------
router.patch('/:id', requireAuth, (req, res) => {
  const { status } = req.body;

  if (!['new', 'contacted', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Status must be one of: new, contacted, closed.' });
  }

  const existing = db.prepare('SELECT id FROM inquiries WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Inquiry not found.' });
  }

  db.prepare('UPDATE inquiries SET status = ? WHERE id = ?').run(status, req.params.id);
  const inquiry = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(req.params.id);
  res.json({ inquiry });
});

module.exports = router;
