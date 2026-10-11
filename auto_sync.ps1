# Auto-Sync Watcher for FieldAssist Monorepo
# Automatically detects changes, commits, and pushes to https://github.com/Akarsh5555/field_project_both

[Console]::Title = "FieldAssist - GitHub Auto-Sync Active"
Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " FieldAssist Monorepo: Auto-Push Watcher Running" -ForegroundColor Green
Write-Host " Target: https://github.com/Akarsh5555/field_project_both" -ForegroundColor Yellow
Write-Host " Status: Monitoring for file changes every 10 seconds..." -ForegroundColor Gray
Write-Host " Press Ctrl+C in this window at any time to stop." -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$workspace = Split-Path -Parent $MyInvocation.MyCommand.Path

while ($true) {
    try {
        Set-Location $workspace
        $status = git status --porcelain
        if ($status) {
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            Write-Host "[$timestamp] Detected changes:" -ForegroundColor Yellow
            $status | ForEach-Object { Write-Host "   $_" -ForegroundColor DarkYellow }
            
            # Settle time in case multiple files are being saved
            Start-Sleep -Seconds 3
            
            git add -A
            $commitMsg = "auto: sync changes ($timestamp)"
            git commit -m $commitMsg
            
            Write-Host "[$timestamp] Pushing to GitHub (origin/main)..." -ForegroundColor Cyan
            git push origin main
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[$timestamp] SUCCESS: Pushed to GitHub!" -ForegroundColor Green
            } else {
                Write-Host "[$timestamp] Push returned non-zero code. Will retry next cycle." -ForegroundColor Red
            }
            Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray
        }
    } catch {
        Write-Host "Watcher error: $_" -ForegroundColor Red
    }
    Start-Sleep -Seconds 10
}
