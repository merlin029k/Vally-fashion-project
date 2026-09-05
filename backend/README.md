# Vally Fashion Backend API

A real backend for the Vally Fashion Cultural Center website: products stored
in a database (not localStorage), image uploads, and password-protected
admin actions using hashed passwords + JWT — replacing the client-side-only
password gate from the earlier prototype.

## Stack

- **Node.js + Express** — server and routing
- **SQLite** (via Node's built-in `node:sqlite`, requires Node 22.5+) —
  file-based database, zero setup, easy to swap for PostgreSQL later if
  you need concurrent writes at scale
- **bcryptjs** — password hashing
- **jsonwebtoken** — admin session tokens
- **multer** — image upload handling

## Project structure

```
vally-backend/
├── server.js              Entry point — wires up routes & middleware
├── db/
│   ├── index.js            Database connection + schema (auto-created)
│   ├── seed.js              Creates the first admin user + sample products
│   └── vally.db             Created automatically on first run
├── middleware/
│   ├── auth.js              JWT verification for protected routes
│   └── upload.js             Multer config for image uploads
├── routes/
│   ├── auth.js               POST /api/auth/login
│   ├── products.js           Product CRUD (public reads, admin writes)
│   └── inquiries.js          Customer inquiries (public submit, admin manage)
├── uploads/                Uploaded product images are stored here
├── .env.example            Copy to .env and fill in real values
└── package.json
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env`:
   - Set `JWT_SECRET` to a long random string. Generate one with:
     ```bash
     node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
     ```
   - Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to your desired first admin login
     (used only once, by the seed script).
   - Set `CLIENT_ORIGIN` to the URL your frontend will run on (e.g.
     `http://localhost:5500` for a local static server, or your real domain
     once deployed).

3. **Create the database and first admin account**
   ```bash
   npm run seed
   ```
   This creates `db/vally.db`, hashes your admin password, and inserts a
   few sample products so the gallery isn't empty.

4. **Start the server**
   ```bash
   npm start
   ```
   Or for auto-restart on file changes during development:
   ```bash
   npm run dev
   ```

5. **Verify it's running**
   ```bash
   curl http://localhost:4000/api/health
   ```

## API Reference

### Auth

**`POST /api/auth/login`** — public
```json
// Request body
{ "email": "admin@vallyfashion.com", "password": "changeme123" }

// Response
{ "token": "eyJhbGciOi...", "admin": { "id": 1, "email": "admin@vallyfashion.com" } }
```
Use the returned `token` in the `Authorization` header for admin-only
routes: `Authorization: Bearer <token>`. Login attempts are rate-limited
(10 per 15 minutes per IP) to slow down password guessing.

### Products

| Method | Route                | Auth   | Description |
|--------|----------------------|--------|--------------|
| GET    | `/api/products`      | Public | List products. Optional query params: `?category=womens\|mens\|accessories`, `?in_stock=true` |
| GET    | `/api/products/:id`  | Public | Get one product |
| POST   | `/api/products`      | Admin  | Create product. `multipart/form-data` with fields `title`, `description`, `category`, and file field `image` |
| PATCH  | `/api/products/:id`  | Admin  | Update product. Same fields as POST, all optional; include `in_stock` (`true`/`false`) to change stock status |
| DELETE | `/api/products/:id`  | Admin  | Delete product |

### Inquiries (customer leads)

| Method | Route                 | Auth   | Description |
|--------|-----------------------|--------|--------------|
| POST   | `/api/inquiries`      | Public | Submit an inquiry. Body: `{ product_id?, name, email, phone?, message }` |
| GET    | `/api/inquiries`      | Admin  | List all inquiries. Optional `?status=new\|contacted\|closed` |
| PATCH  | `/api/inquiries/:id`  | Admin  | Update status. Body: `{ status: "contacted" }` |

### Example: admin creating a product with curl

```bash
# 1. Log in and grab the token
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vallyfashion.com","password":"changeme123"}' | jq -r .token)

# 2. Create a product (image must be a real file path)
curl -X POST http://localhost:4000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Royal Ankara Gown" \
  -F "category=womens" \
  -F "description=Hand-dyed fabric with gold embroidery" \
  -F "image=@/path/to/photo.jpg"
```

## Connecting the frontend

Already wired up — `frontend/main.js` fetches `GET /api/products` to render
the gallery, and `frontend/admin.html` handles login (`POST /api/auth/login`,
token kept in `sessionStorage`), product uploads (`multipart/form-data` to
`POST /api/products`), and deletes (`DELETE /api/products/:id`), all with the
token attached as `Authorization: Bearer <token>`. The API base URL both
files use comes from `frontend/config.js` — update that one file when you
deploy the backend somewhere real.

## Security notes

- Passwords are hashed with bcrypt (12 rounds) — never stored in plain text.
- JWTs expire after 8 hours by default (`JWT_EXPIRES_IN` in `.env`).
- Login and inquiry endpoints are rate-limited to reduce brute-force and
  spam risk.
- CORS is restricted to `CLIENT_ORIGIN` — update this before deploying so
  random sites can't call your API from a browser.
- Uploaded files are validated by MIME type and capped at 5MB.
- `.env` is git-ignored — never commit real secrets.

## Deployment

This app needs a host that runs a persistent Node process (not a
static-only host like plain Vercel/Netlify for the API itself):

- **Railway** or **Render** — both have free tiers, support persistent
  disk (needed for the SQLite file and uploaded images) or add-on
  PostgreSQL if you migrate later.
- Set the same environment variables from `.env` in your host's dashboard.
- Run `npm run seed` once after first deploy (most platforms let you run
  a one-off command, or you can trigger it from a temporary route).

If you outgrow SQLite (many simultaneous admin writes, multi-region
deployment), the schema in `db/index.js` is plain SQL and translates
almost directly to PostgreSQL — the main change would be swapping
`better-sqlite3` for a `pg` client and adjusting the connection setup.
