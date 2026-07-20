# Lend-Ring

A peer-to-peer rental marketplace where people rent out the gear they already own — cameras,
tents, drones, tools, camping kit — to others nearby. Instead of buying a ₹40k drone for one
trip, you rent it from someone down the road; instead of letting yours gather dust, you make a
bit of money off it.

The tricky part of any P2P rental isn't the listing page, it's the trust: how do two strangers
exchange something valuable and be sure the money and the item both come back? Lend-Ring handles
that with a held security deposit (escrow), a commission split, an admin-arbitrated dispute
flow, and a trust score built from real rental history.

Built as an MSc project, but it's a real, deployed, working system — not a toy.

## Live demo

- **App:** https://lend-ring.netlify.app
- **API:** https://lend-ring-api.onrender.com

> Heads up: the API is on Render's free tier, so it sleeps after ~15 min idle. The first request
> after a nap takes ~50s to wake up. Hit the app once and give it a moment before judging it.

## What it does

Three roles, each with its own dashboard:

**Renter**
- Browse and search items (by keyword, category, city, price)
- Book for a date range, pay rent + refundable deposit via Razorpay
- Track orders, mark returns, get the deposit back, review the lender

**Lender**
- List items (photos, daily rate, deposit, availability)
- Approve/decline booking requests, confirm handover and return
- Raise a damage claim with evidence if something comes back broken
- See earnings (your share of rent, after commission), review the renter

**Admin**
- Verify / suspend users, moderate listings
- Resolve disputes by splitting the held deposit
- Audit every transaction on the platform

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React (Vite) + Tailwind CSS | Fast dev, component reuse, utility styling |
| Backend | Node.js + Express | Same language front-to-back, minimal API framework |
| Database | MongoDB + Mongoose (Atlas) | Flexible documents suit evolving entities |
| Auth | JWT + bcrypt | Stateless tokens, salted password hashing |
| Payments | Razorpay (test mode) | India-first, good docs, no KYC needed to build |
| Images | Cloudinary | Upload + CDN + transforms, generous free tier |
| Email | Nodemailer + Gmail SMTP | Booking lifecycle notifications |
| Hosting | Netlify (client) + Render (API) | Static SPA on a CDN, API as a web service |

> Note: Express is pinned to v4. Express 5 broke `express-mongo-sanitize`, so v4 it is until that
> shakes out.

## How it works

The backend is organised in six layers, and every request flows straight down through them:

```
UI (React) -> API client (axios) -> Express route -> middleware/controller -> service -> Mongoose model -> MongoDB
```

Controllers stay thin; the real logic (booking conflict checks, the ledger split, settlement,
trust-score math) lives in the service layer. Same shape for every entity — items, bookings,
disputes — so once you've read one feature you can read them all.

A few decisions worth calling out:

- **Money is stored as integers in paise.** No floats anywhere near currency. `₹450` is `45000`.
- **Payments are an append-only ledger.** Every charge, refund, penalty, and payout is its own
  `Payment` document. Nothing is mutated in place, so the money state is always auditable.
- **Webhooks are idempotent.** Razorpay can deliver the same event twice; each processed event id
  is recorded so a repeat never double-refunds anyone.
- **Settlement is atomic.** The refund/payout step uses `findOneAndUpdate` filtered on state, so two
  concurrent requests (double-click, race) can't both settle the same booking. Learned this the
  hard way — see the concurrency test.

## Getting started

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (free M0 is fine)
- Free accounts: Cloudinary, Razorpay (test mode), and a Gmail app password for SMTP
- ngrok (only if you want to test webhooks locally)

### Backend

```bash
cd server
cp .env.example .env      # then fill in the values (see below)
npm install
npm run seed:admin        # creates the admin account from .env
npm run seed:demo         # optional: 3 demo users + 8 listings
npm run dev               # starts on http://localhost:5000
```

### Frontend

```bash
cd client
cp .env.example .env      # set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev               # starts on http://localhost:5173
```

## Environment variables

`server/.env` (see `server/.env.example`):

| Key | What it is |
|---|---|
| `PORT` | API port (defaults to 5000; Render sets this itself) |
| `MONGO_URI` | Atlas connection string — end it with `/lendring` so it doesn't write to `test` |
| `JWT_SECRET` | Long random string for signing tokens |
| `CLIENT_URL` | Frontend origin for CORS (no trailing slash — this bit me on deploy) |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | Cloudinary creds |
| `RAZORPAY_KEY_ID` / `_KEY_SECRET` | Razorpay test keys (start with `rzp_test_`) |
| `RAZORPAY_WEBHOOK_SECRET` | Your own secret, also set in the Razorpay webhook config |
| `SMTP_USER` / `SMTP_PASS` | Gmail address + 16-char app password |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded admin login (registration can't create admins) |

`client/.env`:

| Key | What it is |
|---|---|
| `VITE_API_URL` | Base URL of the API, e.g. `http://localhost:5000/api` (must include `/api`) |

> `VITE_*` vars are baked in at build time, so set them **before** you build.

## Project structure

```
lend-ring/
├── server/
│   ├── scripts/            # seedAdmin, seedDemo
│   └── src/
│       ├── config/         # db, cloudinary, razorpay, mailer
│       ├── models/         # User, Item, Booking, Payment, Dispute, Review
│       ├── routes/         # one router per resource
│       ├── controllers/    # thin request/response handlers
│       ├── middleware/     # requireAuth, requireRole, upload, error handler
│       ├── services/       # business logic (booking, payment, dispute, return, trust)
│       └── utils/          # dates, money, escapeRegex, format
├── client/
│   └── src/
│       ├── api/            # axios instance + one module per resource
│       ├── pages/          # grouped by role: renter/, lender/, admin/, auth/
│       ├── components/     # shared UI (ItemCard, StatusBadge, ReviewForm, ...)
│       ├── layouts/        # DashboardLayout (role-based sidebar)
│       ├── context/        # AuthContext
│       └── utils/          # money (paise<->rupees), ui classes
└── docs/                   # data model, ER diagram, build notes, references
```

## Payments & webhooks (local)

Card data never touches the server — Razorpay's hosted checkout handles it. The server only sees
order ids, payment ids, and signatures, which it verifies with HMAC-SHA256 before marking anything
paid.

To test the webhook path locally:

```bash
ngrok http 5000
# put the https URL + /api/payments/webhook into the Razorpay dashboard webhook config
# (free ngrok gives a new URL each restart, so you'll re-paste it now and then)
```

Razorpay test instruments: card `4111 1111 1111 1111` (any future expiry / CVV), or UPI
`success@razorpay`. On the OTP screen you can choose Success or Failure to test both paths.

## Seeding demo data

`npm run seed:demo` wipes and recreates demo data — but only touches `@demo.dev` accounts, so your
real test users are safe. Rerun it any time you want a clean slate. Demo password is `demo1234`.

## Deployment

- **Frontend → Netlify.** Base dir `client`, build `npm run build`, publish `dist`. Add a
  `client/public/_redirects` file with `/*  /index.html  200` or client-side routes 404 on refresh.
- **Backend → Render.** Root dir `server`, build `npm install`, start `npm start`. Add all the env
  vars in the dashboard. Don't set `PORT` — Render assigns it.
- **CORS.** Set `CLIENT_URL` on Render to the exact Netlify origin, **no trailing slash**. A stray
  `/` makes the browser reject responses even though the request succeeds. (Yes, that's a real hour
  of my life.)
- **Atlas.** Allow `0.0.0.0/0` in Network Access — Render's outbound IPs aren't fixed.
- After deploy, repoint the Razorpay webhook from ngrok to the Render URL.

## Testing

Beyond manual walkthroughs, the payment engine was checked against an adversarial matrix — forged
signatures, duplicate/tampered webhooks, cross-user payments, wrong-role access, double settlement
— all of which fail safely. There's also a concurrency regression that fires two settlement
requests at once and confirms exactly one succeeds (this caught a real double-refund bug).

## Known limitations

- Free-tier cold starts (~50s wake on the API).
- Payments run in Razorpay test mode; real lender bank payouts would need business KYC and a
  connected-accounts setup.
- Single-region hosting, not production-scale infra.
- No real-time chat or map-based search yet — both on the wishlist.

## License

MIT
