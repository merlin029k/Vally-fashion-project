# Vally Fashion Cultural Center — Full Project

This folder contains the complete website for Vally Fashion Cultural Center:
a public-facing frontend and a real backend API (products, image uploads,
admin authentication, and customer inquiries).

```
vally-fashion-project/
├── frontend/          The public website + admin dashboard (static HTML/CSS/JS)
│   ├── index.html       Main site (hero, about, gallery, contact, etc.)
│   ├── admin.html        Admin dashboard — login, manage products & inquiries
│   ├── config.js          Sets the backend API URL used by the frontend
│   ├── main.js             Gallery rendering, lightbox, inquiry modal
│   ├── i18n.js               EN/FR language toggle
│   ├── forms.js                Contact/newsletter form validation
│   ├── testimonials.js           Testimonial carousel
│   ├── styles.css                  All site styling
│   └── manifest.json                 PWA manifest
│
└── backend/           The Node.js/Express API + SQLite database
    ├── server.js         Entry point
    ├── db/                 Database schema + seed script
    ├── middleware/           Auth (JWT) + image upload handling
    ├── routes/                  Products, auth, inquiries endpoints
    ├── uploads/                   Uploaded product images land here
    ├── .env.example                  Copy to .env and fill in real values
    └── README.md                       Full backend API reference
```

## How the two halves connect

The frontend is entirely static — it can be opened directly or served by
any static file server. It talks to the backend over HTTP, using the URL
set in `frontend/config.js`:

```js
const VALLY_CONFIG = {
  API_BASE_URL: 'http://localhost:4000'
};
```

Change this one line when you deploy the backend somewhere real (e.g.
`https://api.vallyfashion.com`) — nothing else in the frontend needs to
change.

## Running everything locally

You'll run two things at once, in two terminal windows:

**1. Start the backend**
```bash
cd backend
npm install
cp .env.example .env
# edit .env: set JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run seed      # creates the database + your first admin account
npm start          # API now running on http://localhost:4000
```

**2. Start the frontend**
```bash
cd frontend
npx serve .        # or: python3 -m http.server 5500
```
Then open the printed URL (e.g. `http://localhost:5500` or `http://localhost:3000`).

## What to try once both are running

1. Visit the site — the **Collections** gallery loads live from the backend
   (starts with 3 sample products from the seed script).
2. Click **"Ask about this piece"** on any product — submits a real inquiry
   to the database.
3. Go to `admin.html`, log in with the email/password you set in `.env`.
4. Upload a new product with an image — it appears on the live site
   immediately, for every visitor, on every device.
5. Check the **Customer Inquiries** tab in the dashboard to see the
   inquiry you submitted in step 2.

## Deploying for real

- **Frontend**: any static host works — Vercel, Netlify, GitHub Pages, or
  your own web server.
- **Backend**: needs a host that runs a persistent Node process, e.g.
  Railway or Render (both have free tiers). See `backend/README.md` for
  full deployment notes.
- After deploying the backend, update `frontend/config.js` with its real
  URL, and update `CLIENT_ORIGIN` in the backend's environment variables
  to match your deployed frontend's URL (this is what CORS uses to decide
  which sites are allowed to call the API).

See `backend/README.md` for the full API reference (every endpoint,
request/response shapes, and curl examples).
