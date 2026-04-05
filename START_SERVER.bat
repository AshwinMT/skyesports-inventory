@echo off
title Skyesports Inventory System
color 0B
cls

echo.
echo  ============================================================
echo    SKYESPORTS INVENTORY MANAGEMENT SYSTEM  v2.0
echo  ============================================================
echo.

:: Check Node.js is installed
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Node.js is not installed!
    echo.
    echo  Please download and install Node.js LTS from:
    echo  https://nodejs.org
    echo.
    echo  After installing, run this file again.
    echo.
    pause
    exit /b 1
)
for /f %%V in ('node -v') do echo  [OK] Node.js %%V detected

:: Install dependencies if node_modules missing
if not exist "node_modules\" (
    echo.
    echo  [SETUP] First-time setup: Installing dependencies...
    echo  This will take about 1-2 minutes, please wait...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo  [ERROR] npm install failed!
        echo  Make sure you have internet access and try again.
        pause
        exit /b 1
    )
    echo.
    echo  [OK] All dependencies installed successfully!
)

:: Get local network IP
set LOCAL_IP=your-local-ip
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set LOCAL_IP=%%A
    goto :ip_found
)
:ip_found
set LOCAL_IP=%LOCAL_IP: =%

echo.
echo  ============================================================
echo   Server starting...
echo  ============================================================
echo.
echo   Open in browser:
echo     This PC  ^>  http://localhost:3000
echo     Network  ^>  http://%LOCAL_IP%:3000
echo.
echo   Login:  admin / pass
echo.
echo   Share the Network URL with your team on the same WiFi!
echo  ============================================================
echo.

:: Open browser after 3 seconds
start "" /b cmd /c "timeout /t 3 >nul && start http://localhost:3000"

:: Start server
node server.js

echo.
echo  Server stopped.
pause
