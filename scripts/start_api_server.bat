@echo off
setlocal
cd /d "%~dp0\.."

echo Starting HRBMP SQLite API and GUI server...
echo.
echo URL: http://127.0.0.1:8010/gui/
echo Health check: http://127.0.0.1:8010/api/health
echo.
echo This helper uses R if Rscript is available, then falls back to Python.
echo R packages needed for the R server: plumber, DBI, RSQLite
echo.
echo Keep this window open while using API downloads.
echo Press Ctrl+C to stop the server.
echo.

where Rscript >nul 2>nul
if not errorlevel 1 (
  Rscript api\server.R
  goto server_stopped
)

set "BUNDLED_PYTHON=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if exist "%BUNDLED_PYTHON%" (
  "%BUNDLED_PYTHON%" api\server.py
) else (
  python api\server.py
)

:server_stopped
echo.
echo The server stopped.
pause
