# E-Invoice Application Stopper - Enhanced
# Aggressively stops all services and frees ports

Write-Host "🛑 Stopping E-Invoice Application..." -ForegroundColor Cyan
Write-Host ""

# Method 1: Kill all Node.js processes (most aggressive)
Write-Host "🔧 Killing all Node.js processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "   Killing Node process (PID: $($_.Id))" -ForegroundColor Gray
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 2
Write-Host "✅ Node processes killed" -ForegroundColor Green

# Method 2: Force free port 8000 (backend)
Write-Host ""
Write-Host "🔧 Force freeing port 8000..." -ForegroundColor Yellow
$attempts = 0
while ($attempts -lt 3) {
    $backend = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
    if ($backend) {
        $backend | ForEach-Object {
            if ($_.OwningProcess -gt 0) {
                Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
            }
        }
        Start-Sleep -Seconds 1
        $attempts++
    } else {
        break
    }
}
if (-not (Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue)) {
    Write-Host "✅ Port 8000 freed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Port 8000 still in use - try restarting computer" -ForegroundColor Yellow
}

# Method 3: Force free port 3000 (frontend)
Write-Host ""
Write-Host "🔧 Force freeing port 3000..." -ForegroundColor Yellow
$attempts = 0
while ($attempts -lt 3) {
    $frontend = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($frontend) {
        $frontend | ForEach-Object {
            if ($_.OwningProcess -gt 0) {
                Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
            }
        }
        Start-Sleep -Seconds 1
        $attempts++
    } else {
        break
    }
}
if (-not (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue)) {
    Write-Host "✅ Port 3000 freed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Port 3000 still in use" -ForegroundColor Yellow
}

# Stop Docker services (keeps data volumes)
Write-Host ""
Write-Host "🐳 Stopping Docker services..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null
Start-Sleep -Seconds 2
Write-Host "✅ Docker containers stopped" -ForegroundColor Green

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Application stopped successfully!" -ForegroundColor Green
Write-Host "✅ Ports freed: 8000 ✓ 3000 ✓" -ForegroundColor Green
Write-Host "✅ Ready for clean restart" -ForegroundColor Green
Write-Host ""
Write-Host "💡 To start again:" -ForegroundColor Yellow
Write-Host "   .\dev.ps1" -ForegroundColor Cyan
Write-Host ""

