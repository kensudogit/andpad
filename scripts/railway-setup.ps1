# ANDPAD — Railway CLI helper (run from repo root)
# Usage:
#   .\scripts\railway-setup.ps1
#   .\scripts\railway-setup.ps1 -ProjectId "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

param(
    [string]$ProjectId = $env:RAILWAY_PROJECT_ID
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host ""
Write-Host "=== ANDPAD / Railway ===" -ForegroundColor Cyan
Write-Host "Repo:  $Root"
Write-Host "Docs:  docs/RAILWAY.md"
Write-Host ""

if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "Install CLI: https://docs.railway.com/guides/cli" -ForegroundColor Yellow
    exit 1
}

Write-Host "1) railway login" -ForegroundColor Green
Write-Host "2) Link project (pick ONE):" -ForegroundColor Green
Write-Host "   Existing: railway link -p <Project-ID>   # Dashboard -> Settings -> Project ID"
Write-Host "   New:      railway init"
Write-Host "3) Postgres: railway add -d postgres   # or link plugin in Dashboard"
Write-Host "4) Variables:"
Write-Host "   railway variables set JWT_SECRET=<32+ random chars>"
Write-Host "   # DATABASE_URL: set Reference to Postgres in Dashboard"
Write-Host "5) Deploy: git push origin main   # or railway up if not using GitHub"
Write-Host ""
Write-Host "Dashboard checks (CRITICAL):" -ForegroundColor Green
Write-Host "  Root Directory: EMPTY  (if frontend/backend, snapshot ~55KB and Dockerfile missing)"
Write-Host "  Config file:    /railway.toml  or  /railway.json"
Write-Host "  Do NOT set API_URL on unified deploy"
Write-Host "  CORS_ORIGINS / APP_PUBLIC_URL: optional (auto from RAILWAY_PUBLIC_DOMAIN)"
Write-Host ""
Write-Host "After deploy:" -ForegroundColor Green
Write-Host "  https://<domain>/health"
Write-Host "  https://<domain>/status"
Write-Host "  Login: demo@sakura-dental.jp / demo1234"
Write-Host ""

if ($ProjectId) {
    Write-Host "Linking project $ProjectId ..." -ForegroundColor Cyan
    railway link -p $ProjectId
} else {
    Write-Host "Tip: .\scripts\railway-setup.ps1 -ProjectId <id>" -ForegroundColor DarkGray
}
