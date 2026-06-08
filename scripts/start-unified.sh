#!/bin/sh
# Railway ???????: ?? Go API (8081) ? Next.js (PORT) ???????????
set -e

WEB_PORT="${PORT:-3000}"
API_PORT="${API_INTERNAL_PORT:-8081}"

external_api_healthy() {
  case "${API_URL:-}" in
    *127.0.0.1*|*localhost*)
      return 1
      ;;
    http://*|https://*)
      api_base="${API_URL%/}"
      body="$(curl -sf --max-time 8 "${api_base}/health" 2>/dev/null)" || return 1
      echo "$body" | grep -q 'dental-video-api' || return 1
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

if external_api_healthy; then
  echo "[web] external API_URL=${API_URL} — Next.js only (separate api service)"
  unset UNIFIED_DEPLOY
  cd /app/frontend
  PORT="${WEB_PORT}" HOSTNAME=0.0.0.0 exec npm start
fi

export API_INTERNAL_PORT="${API_PORT}"
export API_URL="http://127.0.0.1:${API_PORT}"
export UNIFIED_DEPLOY=1
export SAAS_MONOLITH=true

# Railway Postgres plugin often exposes DATABASE_PRIVATE_URL first.
if [ -z "${DATABASE_URL:-}" ] && [ -n "${DATABASE_PRIVATE_URL:-}" ]; then
  export DATABASE_URL="${DATABASE_PRIVATE_URL}"
  echo "[unified] using DATABASE_PRIVATE_URL as DATABASE_URL"
fi

echo "[unified] web=${WEB_PORT} api=${API_PORT}"
echo "[unified] DATABASE_URL=${DATABASE_URL:+set}${DATABASE_URL:-empty}"
echo "[unified] DATABASE_PRIVATE_URL=${DATABASE_PRIVATE_URL:+set}${DATABASE_PRIVATE_URL:-empty}"
echo "[unified] PGHOST=${PGHOST:+set}${PGHOST:-empty}"
echo "[unified] JWT_SECRET=${JWT_SECRET:+set}${JWT_SECRET:-empty}"
echo "[unified] OPENAI_API_KEY=${OPENAI_API_KEY:+set}${OPENAI_API_KEY:-empty}"
if [ -z "${DATABASE_URL:-}" ] && [ -z "${DATABASE_PRIVATE_URL:-}" ] && [ -z "${PGHOST:-}" ]; then
  echo "[unified] ERROR: DATABASE_URL is required"
  echo "[unified]   dental_video service ? Variables ? + New Variable ? Reference ? Postgres ? DATABASE_URL"
  exit 1
fi
if [ -z "${JWT_SECRET:-}" ] || [ "${JWT_SECRET}" = "dev-only-change-in-production" ]; then
  echo "[unified] WARNING: set a strong JWT_SECRET on Railway"
fi

echo "[unified] starting Go API..."
PORT="${API_PORT}" /app/server &
API_PID=$!

echo "[unified] waiting for API /health..."
ready=0
i=0
while [ "$i" -lt 120 ]; do
  if curl -sf "http://127.0.0.1:${API_PORT}/health" >/dev/null 2>&1; then
    ready=1
    break
  fi
  if ! kill -0 "$API_PID" 2>/dev/null; then
    echo "[unified] ERROR: Go API process exited before becoming ready"
    wait "$API_PID" 2>/dev/null || true
    exit 1
  fi
  i=$((i + 1))
  sleep 0.5
done

if [ "$ready" -ne 1 ]; then
  echo "[unified] ERROR: Go API not ready on 127.0.0.1:${API_PORT} after 60s"
  kill "$API_PID" 2>/dev/null || true
  exit 1
fi

echo "[unified] API ready; starting Next.js on ${WEB_PORT}"
cd /app/frontend
PORT="${WEB_PORT}" HOSTNAME=0.0.0.0 exec npm start
