@echo off
title MyGenie App Server
cd /d "C:\Users\racas\Downloads\Geeney"

REM Check if port 3000 is already running
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo MyGenie server is already running! Opening browser...
    start http://localhost:3000
    exit /b 0
)

echo ===================================================
echo Starting MyGenie Application Server...
echo The browser will open automatically in a few seconds.
echo ===================================================

REM Wait 4 seconds in a background subshell and then open http://localhost:3000
start "" cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:3000"

npm run dev
