# Kill process on specific port
# Usage: .\kill-port.ps1 8000

param(
    [Parameter(Mandatory=$false)]
    [int]$Port = 8000
)

Write-Host "🔍 Checking port $Port..." -ForegroundColor Yellow

try {
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    
    if ($connection) {
        $processIds = $connection | Select-Object -ExpandProperty OwningProcess -Unique
        
        foreach ($pid in $processIds) {
            if ($pid -gt 0) {
                $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "🛑 Killing process: $($process.ProcessName) (PID: $pid)" -ForegroundColor Red
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    Write-Host "✅ Process stopped" -ForegroundColor Green
                }
            }
        }
    } else {
        Write-Host "✅ Port $Port is free" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Could not check port status" -ForegroundColor Yellow
}

