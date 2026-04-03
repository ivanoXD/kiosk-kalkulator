@echo off
REM ============================================
REM   KIOSK KALKULATOR - Full Deploy
REM   Push na GitHub + Deploy na server (1 klik)
REM ============================================

cd /d "C:\Users\Korisnik\Desktop\kiosk ponude app"

echo.
echo ========================================
echo   KIOSK KALKULATOR - Full Deploy
echo   Push + Server Update (1 klik)
echo ========================================
echo.

REM Provjeri promjene
git status --short
echo.

set /p COMMIT_MSG="Upisi poruku promjene: "

if "%COMMIT_MSG%"=="" (
    echo [GRESKA] Nisi upisao poruku.
    pause
    exit /b 1
)

echo.
echo [1/4] Dodajem promjene...
git add -A

echo [2/4] Commitam: "%COMMIT_MSG%"
git commit -m "%COMMIT_MSG%"

echo [3/4] Pusham na GitHub...
git branch -M main
git push -u origin main

echo [4/4] Deployam na server (10.3.8.102)...
ssh mtnet@10.3.8.102 "cd /home/mtnet/kiosk-ponude-app && bash deploy.sh"

echo.
echo ========================================
echo   FULL DEPLOY ZAVRSEN!
echo   GitHub: AZURIRAN
echo   Server: http://10.3.8.102:3002
echo ========================================
echo.
pause
