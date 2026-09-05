/**
 * db/seed.js
 * Run with: npm run seed
 *
 * Creates the first admin account (from .env) if none exists yet,
 * and inserts a few sample products so the gallery isn't empty on
 * first run. Safe to re-run — it won't duplicate the admin account.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const bcrypt = require('bcryptjs');
const db = require('./index');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// ---- Minimal solid-color PNG encoder (no external deps) ----
// Only used to generate placeholder images for the sample products below,
// so a fresh `npm run seed` doesn't leave the gallery pointing at missing files.
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function writeSolidPng(filePath, width, height, [r, g, b]) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: truecolor RGB
  ihdr[10] = 0; // compression method
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace method

  const row = Buffer.alloc(1 + width * 3); // leading filter-type byte (0 = none)
  for (let x = 0; x < width; x++) {
    row[1 + x * 3] = r;
    row[1 + x * 3 + 1] = g;
    row[1 + x * 3 + 2] = b;
  }
  const raw = Buffer.concat(Array(height).fill(row));
  const idatData = zlib.deflateSync(raw);

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const png = Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idatData),
    pngChunk('IEND', Buffer.alloc(0))
  ]);

  fs.writeFileSync(filePath, png);
}

function ensurePlaceholderImages() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const placeholders = {
    'placeholder-womens.png': [176, 141, 87],    // gold
    'placeholder-mens.png': [58, 66, 102],       // deep indigo
    'placeholder-accessories.png': [122, 47, 47] // deep red
  };
  for (const [name, color] of Object.entries(placeholders)) {
    const filePath = path.join(UPLOAD_DIR, name);
    if (!fs.existsSync(filePath)) {
      writeSolidPng(filePath, 600, 600, color);
      console.log(`Generated placeholder image: ${name}`);
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
  ensurePlaceholderImages();

  const count = db.prepare('SELECT COUNT(*) AS n FROM products').get().n;
  if (count > 0) {
    console.log(`Products table already has ${count} item(s) — skipping sample data.`);
    return;
  }

  const sample = [
    { title: 'Traditional Royal Dress', description: 'Hand-embroidered ceremonial dress with gold thread detailing.', category: 'womens', image_url: '/uploads/placeholder-womens.png' },
    { title: 'Premium Agbada', description: 'Full-length flowing robe in premium woven fabric.', category: 'mens', image_url: '/uploads/placeholder-mens.png' },
    { title: 'Handcrafted Bead Necklace', description: 'Traditional beadwork necklace, handmade by local artisans.', category: 'accessories', image_url: '/uploads/placeholder-accessories.png' }
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

  console.log(`Inserted ${sample.length} sample products.`);
}

seedAdmin();
seedProducts();
console.log('Seeding complete.');