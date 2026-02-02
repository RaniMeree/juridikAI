@echo off
echo ============================================
echo   Quick Deploy - Admin Panel Fix
echo ============================================
echo.

cd /d "%~dp0"

echo Adding changes...
git add frontend/admin/index.html
git add backend/main.py

echo.
echo Committing...
git commit -m "Fix admin panel API URL and CORS"

echo.
echo Pushing to remote...
git push

echo.
echo ============================================
echo   Deploy Complete!
echo ============================================
echo.
echo Wait 5-10 minutes for Render to redeploy
echo Then go to: https://juridikai-1.onrender.com/admin
echo.
pause
