# 🪨 NASA NEO MONITOR

> Asteroid come near Earth. Caveman watch. Caveman warn.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat-square&logo=postgresql)](https://postgresql.org)
[![Railway](https://img.shields.io/badge/deploy-Railway-0B0D0E?style=flat-square&logo=railway)](https://railway.app)
[![Vercel](https://img.shields.io/badge/deploy-Vercel-000?style=flat-square&logo=vercel)](https://vercel.com)

---

## WHAT THIS DO

```
NASA API ──► FastAPI backend ──► PostgreSQL cache ──► React frontend
              (proxy + chunk)      (no repeat call)    (pixel art UI)
```

Rock fly near Earth. App show rock. App remember rock. Rock not need to fly again for app to show.

**Features:**
- 🟢 Asteroid list with filters (dangerous / safe) and sort (distance, diameter)
- 🟡 Date range up to 365 days — backend splits into 7-day chunks automatically
- 🔴 Pixel art UI — Press Start 2P font, color-coded data, CRT scanlines
- 📊 Two Recharts charts: miss distance over time + top 20 by diameter
- 🔍 Detail page per asteroid: orbital data, close approach history, NASA JPL link
- 💾 PostgreSQL cache — same date range queried twice → NASA not called again
- ⚠️ PHO badges, skeleton loaders, typed error messages (429, 500, date validation)

---

## STACK

| Layer | Tech |
|-------|------|
| Backend | FastAPI · SQLAlchemy · python-decouple |
| Database | PostgreSQL 17 |
| Frontend | React 18 · Vite · Tailwind CSS · Recharts |
| Font | Press Start 2P |
| Deploy | Railway (backend + DB) · Vercel (frontend) |

---

## RUN LOCAL

**Need:** Docker + Docker Compose

```bash
git clone https://github.com/davideblaffard/nasa-challenge
cd nasa-challenge

# Copy env file
cp .env/.dev-sample .env/.dev-sample   # already has dev values

# Start everything
docker compose up
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:80 |
| Backend API | http://localhost:8001 |
| Docs (Swagger) | http://localhost:8001/docs |

**Frontend dev server** (hot reload):
```bash
cd frontend
npm install
npm run dev   # → http://localhost:5173, proxies /api → :8001
```

---

## ENV VARS

### Backend (Railway)
```env
DATABASE_URL=    # auto-injected by Railway PostgreSQL plugin
NASA_API_KEY=    # get free key at https://api.nasa.gov (500 req/h)
ALLOWED_ORIGIN=  # Vercel frontend URL — restricts CORS (default: *)
```

### Frontend (Vercel)
```env
VITE_API_URL=    # Railway backend URL — baked at build time
```

> 🔒 Never commit `.env/.prod` — it is gitignored. Add secrets in Railway / Vercel dashboards only.

---

## DEPLOY

**Prereqs:**
```bash
npm install -g @railway/cli vercel
railway login
vercel login
```

**Railway:** create project → add PostgreSQL plugin → link service:
```bash
cd backend && railway link && railway service
```

**One command deploy:**
```bash
./deploy.sh
```

Script does:
1. Sets `NASA_API_KEY` in Railway (hidden input, not logged)
2. Deploys backend via `railway up`
3. Sets `VITE_API_URL` in Vercel
4. Deploys frontend via `vercel --prod`
5. Prints both live URLs

---

## API

```
GET /api/feed?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
GET /api/neo/{nasa_id}
```

- Max range: **365 days**
- NASA NeoWS hard limit: 7 days/request → backend chunks automatically
- NeoDetail cache TTL: **7 days**
- Interactive docs: `/docs`

---

## COLOR SYSTEM

```
#00ff41  pulse   →  safe asteroids, primary actions
#ff2a6d  hazard  →  PHO (Potentially Hazardous Objects)
#05d9e8  cyan    →  dates
#ffd700  amber   →  velocity
#b14cf8  purple  →  magnitude
#ff6b35  orange  →  distance
```

---

## PROJECT STRUCTURE

```
nasa-challenge/
├── backend/
│   ├── app/
│   │   ├── main.py       # routes, error handling
│   │   ├── cache.py      # DB proxy logic
│   │   ├── nasa.py       # NASA client, chunking
│   │   ├── models.py     # Asteroid, NeoDetailCache
│   │   └── schemas.py    # Pydantic output models
│   ├── Dockerfile
│   ├── railway.toml
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # Dashboard, Table, Charts, Detail, Tooltip…
│   │   ├── App.jsx
│   │   └── api.js
│   ├── vercel.json
│   └── package.json
├── docker-compose.yml
├── docker-compose.prod.yml
├── deploy.sh
└── CLAUDE.md             # AI context file
```

---

## DATA SOURCE

[NASA NeoWS API](https://api.nasa.gov) — Near Earth Object Web Service.  
Free key: 500 requests/hour. No asteroid was harmed in the making of this app.

---

*Built with FastAPI + React + too much caffeine.*
