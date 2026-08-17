# CyberSure — Vanilla HTML/CSS/JS Edition

This is the same CyberSure product (design, copy, 9 scanners, auth, dashboard,
admin panel) rebuilt with **plain HTML, CSS, and JavaScript** on the frontend
instead of React — no JSX, no build step, no npm install needed for the
frontend at all. The **backend** is Node.js + Express + **PostgreSQL**
(via Sequelize) + JWT, same rule-based scam analyzer.

```
cybersure-vanilla/
├── frontend/            # plain HTML/CSS/JS single-page app
│   ├── index.html
│   ├── css/style.css
│   └── js/               (ES modules — router, pages, components)
└── backend/              # Node/Express/PostgreSQL (Sequelize) API
    ├── server.js
    ├── routes/  models/  middleware/  utils/  config/
```

## How the frontend works

- **No build tools.** `index.html` loads Tailwind CSS via the official Play
  CDN (`cdn.tailwindcss.com`), configured with the *exact* same color tokens,
  fonts, radii, and animations as the original `tailwind.config.js` — so the
  look is pixel-identical.
- **Routing** is a small hand-written client-side router (`js/router.js`)
  using the History API — same routes/URLs as the original React Router setup,
  including `/scam-detector?tab=website` etc.
- **Icons** use the Lucide CDN build (`data-lucide="..."` + `lucide.createIcons()`),
  the same icon set the original used via `lucide-react`.
- **Charts** (Dashboard page) use Chart.js from a CDN in place of Recharts.
- **QR decoding** uses jsQR from a CDN, exactly like the original.
- Every page/component from the React app has a 1:1 counterpart:
  `Navbar.jsx → js/navbar.js`, `Home.jsx → js/pages/home.js`,
  `checkers/*.jsx → js/pages/scamDetector.js`, etc.

## Running it locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then edit DATABASE_URL / JWT_SECRET
npm run seed               # optional: creates demo + admin accounts
npm run dev                 # starts on http://localhost:5000
```

Demo accounts after seeding:
- Admin: `admin@cybersure.io` / `admin123`
- User: `demo@cybersure.io` / `demo1234`

### 2. Frontend

The frontend is plain static files, so **any** static file server works.
Two easy options:

**Option A — let the backend serve it (simplest):**
`server.js` already serves the sibling `../frontend` folder and falls back to
`index.html` for client-side routes. Just keep this repo's folder layout and
open `http://localhost:5000` once the backend is running.

**Option B — serve it separately** (e.g. while developing):
```bash
cd frontend
python3 -m http.server 5173
# or: npx serve .
```
Then open `http://localhost:5173`. `frontend/js/api.js` auto-points to
`http://localhost:5000/api` when running on `localhost`.

### 3. Deploying

- **Backend** → Render.com (or any Node host): same steps as before
  (Node environment, `npm start`, set `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`).
  For the database itself, a free Postgres instance from **Neon**, **Supabase**,
  or **Railway** works well — just set `PGSSL=true` alongside `DATABASE_URL`.
- **Frontend** → any static host (Vercel, Netlify, GitHub Pages, or the
  backend's own static-serving as described above). If you host the frontend
  on a **different domain** than the backend, open `frontend/js/api.js` and
  change the production `API_BASE` to your deployed backend's `/api` URL.

## What stayed the same

- Visual design system (colors, typography, spacing, radii, animations)
- Every page, route, and piece of copy
- The 9 scanner types and their exact rule-based scoring logic (`utils/scamAnalyzer.js`)
- Auth flow, JWT, admin panel, dashboard charts, scan history with filters/pagination

## What changed

- Frontend framework: React + Vite + Tailwind build → plain HTML + CSS + JS (ES modules), Tailwind via CDN, no build step
- State management: React Context → small plain-JS modules with a pub/sub pattern
- Animations: Framer Motion → CSS keyframes/transitions
- Charts: Recharts → Chart.js
- Database: MongoDB (Mongoose) → PostgreSQL (Sequelize) — relational tables with foreign keys for `User` → `History` → `Report` instead of loose documents
