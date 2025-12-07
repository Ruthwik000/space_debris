@echo off
echo Starting Space Debris Dashboard...
echo.

echo [1/2] Starting Backend Server...
start cmd /k "cd backend && python app.py"

timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend...
start cmd /k "cd frontend && npm start"

echo.
echo Dashboard is starting!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
