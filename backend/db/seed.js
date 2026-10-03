/**
 * db/seed.js
 * Run with: npm run seed
 *
 * Creates the first admin account (from .env) if none exists yet,
 * and inserts the starter product catalog (from db/seed-images/) so
 * the gallery isn't empty on first run. Safe to re-run — it won't
 * duplicate the admin account or re-insert products that already exist.
 *
 * Runs on every boot (see render.yaml's startCommand). On a host without
 * a persistent disk, the SQLite file and /uploads folder are wiped on
 * each restart, so this script re-copies the seed images and re-inserts
 * the starter catalog every time — the gallery is never empty, even
 * though anything uploaded through the admin dashboard since the last
 * restart will be gone. Images added here (db/seed-images/) are
 * committed to git and therefore always survive restarts/redeploys.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./index');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const SEED_IMAGES_DIR = path.join(__dirname, 'seed-images');

function copySeedImages() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (!fs.existsSync(SEED_IMAGES_DIR)) return;

  for (const file of fs.readdirSync(SEED_IMAGES_DIR)) {
    const dest = path.join(UPLOAD_DIR, file);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(path.join(SEED_IMAGES_DIR, file), dest);
    }
  }
}

function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before seeding.');
    process.exit(1);
  }

  const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(email);
  if (existing) {
    console.log(`Admin account already exists for ${email} — skipping.`);
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 12);
  db.prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?)').run(email, passwordHash);
  console.log(`Created admin account: ${email}`);
  console.log('IMPORTANT: log in and consider rotating this password once the account is confirmed working.');
}

function seedProducts() {
  copySeedImages();

  const count = db.prepare('SELECT COUNT(*) AS n FROM products').get().n;
  if (count > 0) {
    console.log(`Products table already has ${count} item(s) — skipping sample data.`);
    return;
  }

  const sample = [
    { title: 'Royal Ankara Gown', description: 'Statement womenswear piece in bold traditional print.', category: 'womens', image_url: '/uploads/seed-womens-1.jpg' },
    { title: 'Beaded Ceremonial Dress', description: 'Fitted ceremonial dress with hand-finished beadwork detailing.', category: 'womens', image_url: '/uploads/seed-womens-2.png' },
    { title: 'Heritage Agbada Robe', description: 'Flowing hand-embroidered robe, styled with a traditional headwrap.', category: 'mens', image_url: '/uploads/seed-mens-1.png' },
    { title: 'Royal Blue Dashiki', description: 'Hand-embroidered dashiki tunic in royal blue with intricate white stitching.', category: 'mens', image_url: '/uploads/seed-mens-2.png' },
    { title: 'Leopard Print Agbada Set', description: 'Statement two-piece set styled with traditional accents.', category: 'mens', image_url: '/uploads/seed-mens-3.png' },
    { title: 'Tribal Statement Necklace', description: 'Handcrafted statement necklace made from natural materials.', category: 'accessories', image_url: '/uploads/seed-accessories-1.png' },
    { title: 'Beaded Twist Necklace Set', description: 'Vibrant handmade beaded necklaces, sold as a pair.', category: 'accessories', image_url: '/uploads/seed-accessories-2.png' },
    { title: 'Carved Pendant Necklace', description: 'Traditional carved wooden pendant necklace with beaded accents.', category: 'accessories', image_url: '/uploads/seed-accessories-3.png' }
  ];

  const insert = db.prepare(`
    INSERT INTO products (title, description, category, image_url, in_stock)
    VALUES (?, ?, ?, ?, 1)
  `);

  db.exec('BEGIN');
  try {
    for (const item of sample) {
      insert.run(item.title, item.description, item.category, item.image_url);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  console.log(`Inserted ${sample.length} starter products.`);
}

seedAdmin();
seedProducts();
console.log('Seeding complete.');
