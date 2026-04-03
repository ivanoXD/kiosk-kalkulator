@echo off
REM ============================================
REM   KIOSK KALKULATOR - Push to GitHub
REM   Pokreni ovaj fajl iz projekta dvoklikom
REM ============================================

cd /d "C:\Users\Korisnik\Desktop\kiosk ponude app"

echo.
echo ========================================
echo   KIOSK KALKULATOR - Git Push
echo ========================================
echo.

REM Provjeri ima li promjena
git status --short
echo.

REM Pitaj korisnika za poruku commita
set /p COMMIT_MSG="Upisi poruku promjene (commit message): "

if "%COMMIT_MSG%"=="" (
    echo [GRESKA] Nisi upisao poruku. Prekidam.
    pause
    exit /b 1
)

echo.
echo [1/3] Dodajem sve promjene...
git add -A

echo [2/3] Commitam s porukom: "%COMMIT_MSG%"
git commit -m "%COMMIT_MSG%"

echo [3/3] Pusham na GitHub (main branch)...
git branch -M main
git push -u origin main

echo.
echo ========================================
echo   GOTOVO! Kod je na GitHubu.
echo   Sada pokreni deploy na serveru.
echo ========================================
echo.
pause
