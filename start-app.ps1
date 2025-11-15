# E-Invoice Application Launcher
# This script starts all services required for the application

Write-Host "🚀 Starting E-Invoice Application..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Start Docker services
Write-Host ""
Write-Host "📦 Starting Docker services (PostgreSQL & Redis)..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker services started" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start Docker services" -ForegroundColor Red
    exit 1
}

# Wait for databases to be ready
Write-Host ""
Write-Host "⏳ Waiting for databases to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if backend dependencies are installed
if (!(Test-Path "backend/node_modules")) {
    Write-Host ""
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    Push-Location backend
    npm install
    Pop-Location
}

# Check if frontend dependencies are installed
if (!(Test-Path "frontend/node_modules")) {
    Write-Host ""
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location frontend
    npm install
    Pop-Location
}

# Start Backend in new window
Write-Host ""
Write-Host "🔧 Starting Backend API Server..." -ForegroundColor Yellow
$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host '🔧 Backend Server Starting...' -ForegroundColor Cyan; npm run dev" -PassThru

# Wait a bit for backend to start
Start-Sleep -Seconds 8

# Start Frontend in new window
Write-Host "🎨 Starting Frontend Application..." -ForegroundColor Yellow
$frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host '🎨 Frontend Starting...' -ForegroundColor Cyan; npm run dev" -PassThru

# Wait for services to start
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✨ E-Invoice Application Started Successfully!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📡 Services Running:" -ForegroundColor White
Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend:   http://localhost:8000" -ForegroundColor Cyan
Write-Host "   Health:    http://localhost:8000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "🗄️  Database Services:" -ForegroundColor White
Write-Host "   PostgreSQL: localhost:5432" -ForegroundColor Cyan
Write-Host "   Redis:      localhost:6379" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Quick Actions:" -ForegroundColor White
Write-Host "   • Open app:      start http://localhost:3000" -ForegroundColor Yellow
Write-Host "   • View database: cd backend; npm run prisma:studio" -ForegroundColor Yellow
Write-Host "   • Stop all:      .\stop-app.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C in the Backend and Frontend windows to stop them" -ForegroundColor Gray
Write-Host ""

# Optionally open browser
$openBrowser = Read-Host "Open application in browser? (y/n)"
if ($openBrowser -eq 'y' -or $openBrowser -eq 'Y') {
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:3000"
    Write-Host "🌐 Browser opened!" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Setup Complete! Happy coding! 🎉" -ForegroundColor Green

