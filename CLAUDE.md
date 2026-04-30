# NASA NEO Monitor — Project Context

## Stack
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL (Railway)
- **Frontend**: React + Vite + Tailwind + Recharts (Vercel)
- **Font**: Press Start 2P (pixel art aesthetic)
- **Auth**: none (public API)

## Architecture
```
Frontend (Vercel) → FastAPI (Railway) → PostgreSQL cache → NASA NeoWS API
```
Frontend never calls NASA directly. Backend proxies + caches in DB.

## Key files
```
backend/app/
  main.py       # FastAPI routes, CORS, NASAAPIError handling
  cache.py      # DB caching logic, 7-day TTL for NeoDetailCache
  nasa.py       # NeoWSClient singleton, NASAAPIError, split_range
  models.py     # Asteroid, NeoDetailCache (SQLAlchemy)
  schemas.py    # AsteroidOut (computed diameter_avg_m), NeoDetail
  database.py   # engine init with critical logging

frontend/src/
  api.js                      # fetch wrapper, specific error messages per status
  components/Dashboard.jsx    # date picker, stats, charts, table
  components/AsteroidTable.jsx
  components/AsteroidDetail.jsx
  components/Charts.jsx       # Recharts scatter + bar
  components/FilterBar.jsx
  components/Tooltip.jsx
```

## Env vars
### Railway (backend)
| Var | Notes |
|-----|-------|
| `DATABASE_URL` | Auto-injected by Railway PostgreSQL plugin |
| `NASA_API_KEY` | Set manually via `railway variables --set` |
| `ALLOWED_ORIGIN` | CORS — set to Vercel URL in prod (default `*`) |

### Vercel (frontend)
| Var | Notes |
|-----|-------|
| `VITE_API_URL` | Railway backend URL — baked at build time |

## API endpoints
```
GET /api/feed?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
GET /api/neo/{nasa_id}
```
- Max range: 365 days (backend enforces)
- NASA NeoWS limit: 7 days/call → backend auto-chunks
- NeoDetail cache TTL: 7 days

## Color palette
| Token | Hex | Used for |
|-------|-----|----------|
| `pulse` | `#00ff41` | safe asteroids, primary green |
| `hazard` | `#ff2a6d` | PHO asteroids |
| `cyan` | `#05d9e8` | dates |
| `amber` | `#ffd700` | velocity |
| `purple` | `#b14cf8` | magnitude |
| `orange` | `#ff6b35` | distance |
| `dim` | `#666688` | labels |
| `silver` | `#c0c0d0` | body text |

## Deploy commands
```bash
# Backend → Railway
cd backend
railway service          # link service if needed
railway up --detach      # deploy

# Frontend → Vercel
cd frontend
vercel --prod            # deploy

# Full pipeline (from repo root)
./deploy.sh
```

## Local dev
```bash
# Start all services
docker compose up

# Frontend dev server only (proxies /api → localhost:8001)
cd frontend && npm install && npm run dev

# Backend available at localhost:8001
# Frontend dev at localhost:5173
```

## Caching behavior
- Feed: checks existing dates in DB, fetches only missing dates from NASA
- NeoDetail: cached indefinitely until 7-day TTL expires, then re-fetches
- Same date range requested twice → NASA not called second time

## Error handling
- `NASAAPIError` (nasa.py) — typed exception with HTTP status code
- 429 → propagates to frontend with specific message
- 5xx → propagates with specific message
- DB init failure → logged as CRITICAL before crash
- Frontend validates dates before submit (start > end, range > 365d)

## Repo
`https://github.com/davideblaffard/nasa-challenge`
