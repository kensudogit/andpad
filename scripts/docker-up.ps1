# Docker Compose helper: pick a free gateway host port, then start the stack.
param(
    [int]$PreferredPort = 18080
)

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

function Test-PortInUse([int]$Port) {
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    return $null -ne $conn
}

$port = $PreferredPort
if ($env:GATEWAY_HOST_PORT) {
    $port = [int]$env:GATEWAY_HOST_PORT
} elseif (Test-PortInUse 8080) {
    Write-Host "[docker-up] Port 8080 is in use (often dev:monolith server.exe)."
    Write-Host "[docker-up] Using GATEWAY_HOST_PORT=$port for Gateway."
    $env:GATEWAY_HOST_PORT = "$port"
} elseif (-not $env:GATEWAY_HOST_PORT) {
    # Keep compose default (18080) unless user wants 8080 explicitly.
    $env:GATEWAY_HOST_PORT = "$port"
}

if (Test-PortInUse $port) {
    Write-Error "Port $port is already in use. Set GATEWAY_HOST_PORT to another free port or stop the conflicting process."
}

$webPort = if ($env:WEB_HOST_PORT) { $env:WEB_HOST_PORT } else { '3001' }
$gwPort = if ($env:GATEWAY_HOST_PORT) { $env:GATEWAY_HOST_PORT } else { '18080' }
Write-Host "[docker-up] Web      -> http://localhost:$webPort"
Write-Host "[docker-up] Gateway -> http://localhost:$gwPort/graphql"
docker compose up -d @args
