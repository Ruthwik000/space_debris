Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Space Debris Dashboard - Setup & Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "[1/4] Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  Found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check Node.js
Write-Host "[2/4] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "  Found: Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Node.js not found. Please install Node.js 16+" -ForegroundColor Red
    exit 1
}

# Install Backend Dependencies
Write-Host "[3/4] Installing Backend Dependencies..." -ForegroundColor Yellow
Set-Location backend
Write-Host "  Running: pip install -r requirements.txt" -ForegroundColor Gray
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Failed to install backend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "  Backend dependencies installed!" -ForegroundColor Green
Set-Location ..

# Install Frontend Dependencies
Write-Host "[4/4] Installing Frontend Dependencies..." -ForegroundColor Yellow
Set-Location frontend
Write-Host "  Running: npm install (this may take a few minutes...)" -ForegroundColor Gray
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Failed to install frontend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "  Frontend dependencies installed!" -ForegroundColor Green
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Start the application
Write-Host "Starting the application..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host 'Backend Server' -ForegroundColor Cyan; python app.py"

Start-Sleep -Seconds 3

Write-Host "Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host 'Frontend Development Server' -ForegroundColor Cyan; npm start"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Dashboard is starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend API:  http://localhost:5000" -ForegroundColor White
Write-Host "Frontend UI:  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Two new windows will open for backend and frontend." -ForegroundColor Gray
Write-Host "Wait for 'Compiled successfully!' message in frontend window." -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
