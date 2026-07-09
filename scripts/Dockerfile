# =============================================================================
# STOP: Railway Root Directory is wrongly set to "scripts/"
# =============================================================================
# This file exists only so the Metal builder fails with a clear message instead
# of "couldn't locate the dockerfile".
#
# Fix (Dashboard → service → Settings → Build):
#   1. Root Directory  = (empty / clear)
#   2. Config file     = /railway.toml
#   3. Dockerfile Path = (empty)
#   4. Redeploy latest commit from repo ROOT
#
# Or deploy from CLI (repo root):
#   railway up --path-as-root .
#   .\scripts\railway-up.ps1
# =============================================================================
FROM alpine:3.20
RUN printf '%s\n' \
  'ERROR: Railway Root Directory is set to scripts/' \
  'Clear Root Directory (leave EMPTY) and set Config file path to /railway.toml' \
  'Then Redeploy. See docs/RAILWAY.md' \
  >&2 && exit 1
