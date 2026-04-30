#!/bin/bash
set -e

# ─── Prerequisites ────────────────────────────────────────────────────────────

check_cmd() {
  if ! command -v "$1" &>/dev/null; then
    echo "ERROR: '$1' CLI not found. Install with:"
    echo "  $2"
    exit 1
  fi
}

check_cmd railway "npm install -g @railway/cli  →  then: railway login"
check_cmd vercel  "npm install -g vercel         →  then: vercel login"

# ─── Safety: block if secrets would leak ─────────────────────────────────────

if git rev-parse --git-dir &>/dev/null 2>&1; then
  if git ls-files --error-unmatch .env/.prod &>/dev/null 2>&1; then
    echo "ERROR: .env/.prod is tracked by git — secrets would be exposed."
    echo "  Fix: git rm --cached .env/.prod && echo '.env/.prod' >> .gitignore"
    exit 1
  fi
fi

# ─── BACKEND → Railway ────────────────────────────────────────────────────────

echo ""
echo "── BACKEND (Railway) ────────────────────────────────────────────────────"
echo ""
echo "  Railway needs a PostgreSQL plugin attached to your project."
echo "  If first deploy: go to railway.app → your project → New → Database → PostgreSQL"
echo "  (DATABASE_URL is auto-injected by Railway — do not set it manually)"
echo ""

cd backend

echo "→ Checking Railway project link..."
if ! railway status &>/dev/null 2>&1; then
  echo "  No linked project. Launching 'railway link'..."
  railway link
fi

echo "→ Linking Railway service (required before setting variables)..."
railway service

echo "→ Setting NASA_API_KEY in Railway (input hidden, not logged)..."
if railway variables 2>/dev/null | grep -q "NASA_API_KEY"; then
  echo "  NASA_API_KEY already set. Skip? [y/N]"
  read -r SKIP_KEY
  if [[ "$SKIP_KEY" != "y" && "$SKIP_KEY" != "Y" ]]; then
    printf "  New value: "
    read -rs NASA_KEY
    echo ""
    railway variables --set "NASA_API_KEY=$NASA_KEY"
    unset NASA_KEY
  fi
else
  printf "  Enter NASA_API_KEY: "
  read -rs NASA_KEY
  echo ""
  railway variables --set "NASA_API_KEY=$NASA_KEY"
  unset NASA_KEY
fi

echo "→ Deploying backend..."
railway up --detach

echo "→ Getting backend URL..."
BACKEND_URL=$(railway domain 2>/dev/null | grep -oE 'https://[^ ]+' | head -1 || true)

if [ -z "$BACKEND_URL" ]; then
  echo ""
  echo "  Could not read URL automatically."
  echo "  Find it: railway.app → your project → Settings → Networking → Public Domain"
  printf "  Paste backend URL (https://...): "
  read -r BACKEND_URL
fi

echo "  Backend: $BACKEND_URL"

cd ..

# ─── FRONTEND → Vercel ───────────────────────────────────────────────────────

echo ""
echo "── FRONTEND (Vercel) ────────────────────────────────────────────────────"
echo ""

cd frontend

echo "→ Setting VITE_API_URL=$BACKEND_URL in Vercel..."
vercel env rm VITE_API_URL production --yes 2>/dev/null || true
echo "$BACKEND_URL" | vercel env add VITE_API_URL production

echo "→ Deploying frontend..."
DEPLOY_OUTPUT=$(vercel --prod 2>&1)
echo "$DEPLOY_OUTPUT"

FRONTEND_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[^ ]+\.vercel\.app' | tail -1 || true)

cd ..

# ─── Summary ─────────────────────────────────────────────────────────────────

echo ""
echo "✓ Deploy complete"
echo "  Backend  → $BACKEND_URL"
echo "  Frontend → ${FRONTEND_URL:-check Vercel output above}"
echo ""
echo "  CORS: backend allows all origins (*). Tighten in production:"
echo "  backend/app/main.py → allow_origins=[\"$FRONTEND_URL\"]"
