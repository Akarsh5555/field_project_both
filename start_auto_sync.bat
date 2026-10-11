@echo off
echo ========================================================
echo  Starting FieldAssist GitHub Auto-Push Watcher
echo ========================================================
cd /d "%~dp0"
set "PATH=%PATH%;C:\Users\bakar\AppData\Local\MinGit\cmd"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0auto_sync.ps1"
pause
