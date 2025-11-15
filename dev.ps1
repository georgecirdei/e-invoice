# Quick development launcher - ONE-CLICK START!
# Usage: .\dev.ps1

Write-Host "🚀 E-Invoice Development Environment" -ForegroundColor Cyan
Write-Host "   One-Click Launcher v2.0" -ForegroundColor Gray
Write-Host ""

# Check if Docker Desktop is running
Write-Host "🐳 Checking Docker Desktop..." -ForegroundColor Yellow
$dockerRunning = $false
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerRunning = $true
        Write-Host "✅ Docker Desktop is running" -ForegroundColor Green
    }
} catch {
    $dockerRunning = $false
}

if (-not $dockerRunning) {
    Write-Host "⚠️  Docker Desktop is NOT running!" -ForegroundColor Red
    Write-Host "   Please start Docker Desktop and wait for it to be ready" -ForegroundColor Yellow
    Write-Host "   Then run this script again" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check and kill processes on ports 8000 and 3000
Write-Host ""
Write-Host "🔍 Checking for processes on ports 8000 and 3000..." -ForegroundColor Yellow

# Kill port 8000 (backend)
$backend = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($backend) {
    Write-Host "   Port 8000 in use, stopping process..." -ForegroundColor Gray
    $backend | ForEach-Object {
        if ($_.OwningProcess -gt 0) {
            Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 2
    Write-Host "✅ Port 8000 freed" -ForegroundColor Green
}

# Kill port 3000 (frontend)
$frontend = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($frontend) {
    Write-Host "   Port 3000 in use, stopping process..." -ForegroundColor Gray
    $frontend | ForEach-Object {
        if ($_.OwningProcess -gt 0) {
            Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 2
    Write-Host "✅ Port 3000 freed" -ForegroundColor Green
}

# Start Docker services
Write-Host ""
Write-Host "📦 Starting Docker services (PostgreSQL + Redis)..." -ForegroundColor Yellow
docker-compose up -d 2>&1 | Out-Null
Start-Sleep -Seconds 5

# Verify Docker containers are running
$postgresRunning = docker ps --filter "name=einvoice-postgres" --filter "status=running" -q
$redisRunning = docker ps --filter "name=einvoice-redis" --filter "status=running" -q

if ($postgresRunning -and $redisRunning) {
    Write-Host "✅ Database services running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database services may not be running properly" -ForegroundColor Yellow
    Write-Host "   Check Docker Desktop" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🚀 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host '🔧 E-Invoice Backend Server' -ForegroundColor Cyan; npm run dev"

Write-Host "   Waiting for backend to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 10

Write-Host "✅ Backend started" -ForegroundColor Green
Write-Host ""

Write-Host "🎨 Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host '🖥️  E-Invoice Frontend' -ForegroundColor Cyan; npm run dev"

Write-Host "   Waiting for frontend to build..." -ForegroundColor Gray
Start-Sleep -Seconds 8

Write-Host "✅ Frontend started" -ForegroundColor Green
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ E-Invoice Platform Ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📡 Access Points:" -ForegroundColor White
Write-Host "   🌐 Frontend:   http://localhost:3000" -ForegroundColor Cyan
Write-Host "   ⚙️  Backend:    http://localhost:8000" -ForegroundColor Cyan
Write-Host "   🗄️  Database:   Run 'cd backend; npm run prisma:studio'" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 Super Admin Login:" -ForegroundColor White
Write-Host "   📧 Email:      admin@admin.com" -ForegroundColor Gray
Write-Host "   🔑 Password:   Admin123!" -ForegroundColor Gray
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tip: Close backend/frontend windows to stop servers" -ForegroundColor Yellow
Write-Host "   Or run: .\stop-app.ps1" -ForegroundColor Yellow
Write-Host ""

# Open browser after everything is ready
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"

Write-Host "🌐 Browser opened - Your platform is ready to use!" -ForegroundColor Green
Write-Host ""

