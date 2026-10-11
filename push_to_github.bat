@echo off
echo ========================================================
echo  FieldAssist Monorepo - Publishing to GitHub
echo ========================================================
echo.

cd /d "%~dp0"
set "PATH=%PATH%;C:\Users\bakar\AppData\Local\MinGit\cmd"

echo Current Git Remote:
git remote -v
echo.
echo If you created a new GitHub repository (e.g. https://github.com/Akarsh5555/fieldassist.git):
set /p REPO_URL="Enter new GitHub repo URL (or press Enter to keep current): "
if not "%REPO_URL%"=="" (
    git remote remove origin 2>nul
    git remote add origin %REPO_URL%
    echo Remote 'origin' updated to: %REPO_URL%
)

echo.
echo Pushing code to GitHub...
echo If a GitHub browser window opens, click "Sign in with your browser" / "Authorize".
echo.

git branch -M main
git push -u origin main

echo.
echo ========================================================
if %ERRORLEVEL% EQU 0 (
    echo  SUCCESS! Monorepo published to GitHub successfully!
) else (
    echo  Push encountered an issue. See message above.
)
echo ========================================================
pause
