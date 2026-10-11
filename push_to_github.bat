@echo off
echo ========================================================
echo  FieldAssist Monorepo - Publishing to GitHub
echo ========================================================
echo.

cd /d "%~dp0"
set "PATH=%PATH%;C:\Users\bakar\AppData\Local\MinGit\cmd"

echo Repository: https://github.com/Akarsh5555/field_project_both
echo Branch: main
echo.

git push origin main

echo.
echo ========================================================
if %ERRORLEVEL% EQU 0 (
    echo  SUCCESS! Monorepo published to GitHub successfully!
) else (
    echo  Push encountered an issue. See message above.
)
echo ========================================================
pause
