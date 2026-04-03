#!/bin/bash
# ============================================
#   KIOSK KALKULATOR - Server Deploy Script
#   Pokreni na Ubuntu serveru: bash deploy.sh
# ============================================

set -e

APP_DIR="/home/mtnet/kiosk-ponude-app"
PM2_APP_NAME="kiosk-kalkulator"

echo ""
echo "========================================"
echo "  KIOSK KALKULATOR - Server Deploy"
echo "========================================"
echo ""

cd "$APP_DIR"

echo "[1/5] Povlacim najnoviji kod s GitHuba..."
git pull origin main

echo "[2/5] Instaliram nove pakete (ako ih ima)..."
npm install --production=false

echo "[3/5] Kreiram produkcijski build..."
npm run build

echo "[4/5] Kreiram logs direktorij..."
mkdir -p logs

echo "[5/5] Restartujem aplikaciju preko PM2..."
pm2 restart "$PM2_APP_NAME" 2>/dev/null || pm2 start ecosystem.config.js

pm2 save

echo ""
echo "========================================"
echo "  DEPLOY USPJESAN!"
echo "  Aplikacija: http://10.3.8.102:3002"
echo "========================================"
echo ""
