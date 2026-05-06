$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $repoRoot

Write-Host 'Starting HRBMP R API and GUI server...'
Write-Host ''
Write-Host 'URL: http://127.0.0.1:8010/gui/'
Write-Host 'Health check: http://127.0.0.1:8010/api/health'
Write-Host ''
Write-Host 'Required R packages: plumber, DBI, RSQLite'
Write-Host 'Install in R with: install.packages(c("plumber", "DBI", "RSQLite"))'
Write-Host ''
Write-Host 'Keep this window open while using API downloads.'
Write-Host 'Press Ctrl+C to stop the server.'
Write-Host ''

if (-not (Get-Command Rscript -ErrorAction SilentlyContinue)) {
  throw 'Rscript was not found on PATH. Open api/server.R in RStudio and run source("api/server.R") from the repo root.'
}

Rscript api/server.R
