# Vally Fashion Cultural Center — Website

A static, frontend-only website for Vally Fashion Cultural Center. There is
no backend, database, or server — everything runs as plain HTML/CSS/JS and
can be hosted on any static file host.

```
vally-fashion-project/
├── frontend/
│   ├── index.html          Main site (hero, about, heritage, gallery, locations, contact, etc.)
│   ├── main.js              Gallery rendering/filtering, lightbox, image-save deterrents
│   ├── i18n.js                EN/FR language toggle
│   ├── forms.js                 Newsletter signup (client-side only — see note below)
│   ├── testimonials.js            Testimonial carousel
│   ├── styles.css                   All site styling
│   ├── manifest.json                  PWA manifest
│   ├── products/                        The 8 product photos shown in Collections
│   └── *.jpg / *.jpeg / *.png             Hero, about, testimonial and category images
│
└── unused-product-photos/   Extra raw photos not yet added to the site (gitignored)
```

## Running locally

No install, no build step — just serve the `frontend/` folder:

```bash
cd frontend
npx serve .        # or: python3 -m http.server 5500
```

Then open the printed URL (e.g. `http://localhost:5500`).

## Managing the product gallery

The **Collections** section has no admin dashboard or database behind it —
the product list is a plain JavaScript array near the top of `frontend/main.js`:

```js
const PRODUCTS = [
    { id: 1, src: 'products/womens-1.jpg', category: 'womens', title: 'Royal Ankara Gown', description: '...' },
    // ...
];
```

To add, edit, remove, or re-categorize a product:
1. Drop the photo into `frontend/products/`.
2. Add/edit its entry in the `PRODUCTS` array (`category` must be `womens`,
   `mens`, or `accessories` to match the gallery filter buttons).
3. Commit and redeploy.

## Contact

There's no contact or inquiry form — visitors reach out directly via the
phone, WhatsApp, and email links in the Contact section and the floating
WhatsApp button. The newsletter signup in the footer is also client-side
only (just shows a confirmation message); wire it up to a real provider
(Mailchimp, Resend, Netlify Forms, etc.) if you want actual subscriptions.

## Deploying

Any static host works — Netlify, Vercel, GitHub Pages, or your own web
server. This repo includes a `netlify.toml` that builds from `frontend/`.

## A note on image protection

`main.js` and `styles.css` include basic deterrents against casual image
saving (disabled right-click on images, disabled drag, disabled iOS
long-press "Save Image"). These are soft deterrents only — no website can
block OS/browser screenshots or a visitor using dev tools, so don't rely on
this for anything sensitive.
