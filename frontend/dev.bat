@echo off
echo ========================================
echo   DEMARRAGE PROPRE DE L'APPLICATION
echo ========================================
echo.

:: Tuer tous les processus Node.js
echo [1/3] Arret des processus Node.js...
taskkill /F /IM node.exe /T >nul 2>&1

:: Nettoyer le cache
echo [2/3] Nettoyage du cache Next.js...
rmdir /s /q .next >nul 2>&1
rmdir /s /q node_modules\.cache >nul 2>&1

:: Démarrer l'application
echo [3/3] Demarrage de l'application...
echo.
echo ========================================
echo   Application demarree sur :
echo   - Frontend: http://localhost:3000
echo   - WebSocket: ws://localhost:3002
echo ========================================
echo.

npm run dev