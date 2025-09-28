@echo off
echo Starting Football AI Application...
echo.

echo Starting Frontend (React)...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo Waiting 5 seconds for frontend to start...
timeout /t 5 /nobreak >nul

echo.
echo Starting Backend (Python)...
start "Backend" cmd /k "cd /d %~dp0backend && python main.py"

echo.
echo Application started!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8000
echo.
echo Press any key to exit...
pause >nul
