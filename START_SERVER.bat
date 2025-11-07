@echo off
echo ========================================
echo   Mule Secret Santa - Local Testing
echo ========================================
echo.

cd /d "%~dp0Backend"

echo [1/3] Checking if Backend directory exists...
if not exist "server.js" (
    echo ERROR: server.js not found!
    echo Make sure you're running this from the project root.
    pause
    exit /b 1
)
echo OK - Found server.js

echo.
echo [2/3] Starting Backend Server...
echo.
echo Backend running at: http://localhost:3000
echo API health check: http://localhost:3000/api
echo.
echo IMPORTANT: 
echo - Do NOT close this window
echo - Backend must run while using the app
echo - Press Ctrl+C to stop the server
echo.
echo ========================================
echo   Backend Server Starting...
echo ========================================
echo.

node server.js
