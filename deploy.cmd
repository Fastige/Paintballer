@echo off
cd /d "%~dp0"
set PATH=C:\Program Files\Git\bin;C:\Program Files\GitHub CLI;%PATH%

echo Checking GitHub login...
gh auth status
if errorlevel 1 (
  echo.
  echo Run: gh auth login
  exit /b 1
)

echo.
if not exist ".git" git init

git remote get-url origin >nul 2>&1
if errorlevel 1 (
  echo Creating repo and pushing...
  gh repo create Paintballer --public --source=. --remote=origin --push
) else (
  echo Pushing to GitHub...
  git push -u origin main
)

echo.
echo Enabling GitHub Pages...
gh api repos/Fastige/Paintballer/pages -X POST -f build_type=legacy -f source[branch]=main -f source[path]=/ 2>nul

echo.
echo Paintballer should be live at:
echo https://fastige.github.io/Paintballer/
echo (First deploy may take 1-2 minutes.)
pause
