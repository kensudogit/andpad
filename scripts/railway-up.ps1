# ANDPAD — force a correct Railway build context from the repo root.
# Usage (PowerShell, from repo root):
#   .\scripts\railway-up.ps1
#   .\scripts\railway-up.ps1 -ProjectId "<uuid>"
#   .\scripts\railway-up.ps1 -Service "andpad"
#
# Use this when GitHub auto-deploy sends an empty archive
# and fails with: couldn't locate the dockerfile at path Dockerfile

param(
    [string]$ProjectId = $env:RAILWAY_PROJECT_ID,
    [string]$Service = $env:RAILWAY_SERVICE
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "=== railway up (repo root) ===" -ForegroundColor Cyan
Write-Host "Root: $Root"

if (-not (Test-Path (Join-Path $Root "Dockerfile"))) {
    Write-Host "ERROR: Dockerfile missing at repo root" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "Install CLI: https://docs.railway.com/guides/cli" -ForegroundColor Yellow
    exit 1
}

Write-Host "Dockerfile:" -ForegroundColor Green
Get-Item Dockerfile | Format-List Name, Length, FullName

if ($ProjectId) {
    Write-Host "Linking project $ProjectId ..." -ForegroundColor Cyan
    railway link -p $ProjectId
}

Write-Host ""
Write-Host "Dashboard MUST be:" -ForegroundColor Yellow
Write-Host "  Root Directory  = (empty)"
Write-Host "  Config file     = /railway.toml"
Write-Host "  Dockerfile Path = (empty in UI — do not override)"
Write-Host ""

$cmd = "railway up --path-as-root . --ci"
if ($Service) {
    $cmd += " --service $Service"
}

Write-Host "Running: $cmd" -ForegroundColor Cyan
Invoke-Expression $cmd
