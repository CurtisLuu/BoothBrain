@echo off
echo Starting Football AI Application...

echo.
echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "python -m pip install -r requirements.txt && python app.py"
cd ..

echo.
echo Starting Frontend Development Server...
cd frontend
start "Frontend Server" cmd /k "npm install && npm start"
cd ..

echo.
echo Both servers are starting...
echo Backend will be available at: http://localhost:5000
echo Frontend will be available at: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul