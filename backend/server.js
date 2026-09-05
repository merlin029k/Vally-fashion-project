/**
 * server.js
 * Entry point for the Vally Fashion backend API.
 *
 * Endpoints:
 *   POST   /api/auth/login          — admin login, returns JWT
 *   GET    /api/products            — public product list (supports ?category=, ?in_stock=true)
 *   GET    /api/products/:id        — public single product
 *   POST   /api/products            — admin: create product (multipart/form-data with "image")
 *   PATCH  /api/products/:id        — admin: update product
 *   DELETE /api/products/:id        — admin: delete product
 *   POST   /api/inquiries           — public: submit a product/general inquiry
 *   GET    /api/inquiries           — admin: list inquiries
 *   PATCH  /api/inquiries/:id       — admin: update inquiry status
 *   GET    /api/health              — uptime check
 */

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const inquiryRoutes = require('./routes/inquiries');

const app = express();
const PORT = process.env.PORT || 4000;

// ---------- Core middleware ----------
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded product images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- Routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inquiries', inquiryRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------- 404 handler ----------
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ---------- Central error handler ----------
// Catches errors thrown/passed by routes and middleware (e.g. multer file errors)
app.use((err, req, res, next) => {
  console.error(err);

  if (err.message && err.message.includes('Only JPEG, PNG')) {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Image must be smaller than 5MB.' });
  }

  res.status(500).json({ error: 'Something went wrong on our end. Please try again.' });
});

app.listen(PORT, () => {
  console.log(`Vally Fashion API running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
