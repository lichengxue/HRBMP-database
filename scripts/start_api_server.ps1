$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $repoRoot

Write-Host 'Starting HRBMP SQLite API and GUI server...'
Write-Host ''
Write-Host 'URL: http://127.0.0.1:8010/gui/'
Write-Host 'Health check: http://127.0.0.1:8010/api/health'
Write-Host ''
Write-Host 'This helper uses R if Rscript is available, then falls back to Python.'
Write-Host 'R packages needed for the R server: plumber, DBI, RSQLite'
Write-Host ''
Write-Host 'Keep this window open while using API downloads.'
Write-Host 'Press Ctrl+C to stop the server.'
Write-Host ''

if (Get-Command Rscript -ErrorAction SilentlyContinue) {
  Rscript api/server.R
} else {
  $bundledPython = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe'
  if (Test-Path $bundledPython) {
    & $bundledPython api/server.py
  } else {
    python api/server.py
  }
}
