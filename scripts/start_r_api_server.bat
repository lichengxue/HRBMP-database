@echo off
setlocal
cd /d "%~dp0\.."

echo Starting HRBMP R API and GUI server...
echo.
echo URL: http://127.0.0.1:8010/gui/
echo Health check: http://127.0.0.1:8010/api/health
echo.
echo Required R packages: plumber, DBI, RSQLite
echo Install in R with: install.packages(c("plumber", "DBI", "RSQLite"))
echo.
echo Keep this window open while using API downloads.
echo Press Ctrl+C to stop the server.
echo.

where Rscript >nul 2>nul
if errorlevel 1 (
  echo Rscript was not found on PATH.
  echo Open api/server.R in RStudio and run source("api/server.R") from the repo root.
  echo.
  pause
  exit /b 1
)

Rscript api\server.R

echo.
echo The server stopped.
pause
