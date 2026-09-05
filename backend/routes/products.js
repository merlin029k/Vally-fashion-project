/**
 * routes/products.js
 * Public: GET /api/products, GET /api/products/:id
 * Admin-only (requires valid JWT): POST, PATCH, DELETE
 */

const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

const VALID_CATEGORIES = new Set(['womens', 'mens', 'accessories']);

// ---------- Public: list products (with optional category filter) ----------
router.get('/', (req, res) => {
  const { category, in_stock } = req.query;

  let query = 'SELECT * FROM products';
  const conditions = [];
  const params = [];

  if (category && VALID_CATEGORIES.has(category)) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (in_stock === 'true') {
    conditions.push('in_stock = 1');
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC';

  const products = db.prepare(query).all(...params);
  res.json({ products });
});

// ---------- Public: get a single product ----------
router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  res.json({ product });
});

// ---------- Admin: create a product (with image upload) ----------
router.post('/', requireAuth, upload.single('image'), (req, res) => {
  const { title, description = '', category } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  if (!VALID_CATEGORIES.has(category)) {
    return res.status(400).json({ error: "Category must be one of: womens, mens, accessories." });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Product image is required.' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  const result = db.prepare(`
    INSERT INTO products (title, description, category, image_url, in_stock)
    VALUES (?, ?, ?, ?, 1)
  `).run(title.trim(), description.trim(), category, imageUrl);

  const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ product: newProduct });
});

// ---------- Admin: update a product (fields optional; image optional) ----------
router.patch('/:id', requireAuth, upload.single('image'), (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const { title, description, category, in_stock } = req.body;

  if (category && !VALID_CATEGORIES.has(category)) {
    return res.status(400).json({ error: "Category must be one of: womens, mens, accessories." });
  }

  const updated = {
    title: title !== undefined ? title.trim() : existing.title,
    description: description !== undefined ? description.trim() : existing.description,
    category: category || existing.category,
    image_url: req.file ? `/uploads/${req.file.filename}` : existing.image_url,
    in_stock: in_stock !== undefined ? (in_stock === 'true' || in_stock === true ? 1 : 0) : existing.in_stock
  };

  db.prepare(`
    UPDATE products
    SET title = ?, description = ?, category = ?, image_url = ?, in_stock = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(updated.title, updated.description, updated.category, updated.image_url, updated.in_stock, req.params.id);

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json({ product });
});

// ---------- Admin: delete a product ----------
router.delete('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true, id: Number(req.params.id) });
});

module.exports = router;
