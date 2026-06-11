@echo off
echo ====================================
echo   MayeleMoule 2.0 - Demarrage
echo ====================================
echo.

echo [1/2] Lancement du Backend Django...
start "Django Backend" cmd /k "cd /d C:\Users\GLODI\Desktop\Moulin && python manage.py runserver"

timeout /t 3 /nobreak > nul

echo [2/2] Lancement du Frontend React...
start "React Frontend" cmd /k "cd /d C:\Users\GLODI\Desktop\Moulin\frontend && npm run dev"

echo.
echo ====================================
echo  Backend  : http://localhost:8000
echo  Frontend : http://localhost:5173
echo ====================================
echo.
pause
