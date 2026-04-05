#!/bin/bash
clear
echo ""
echo "============================================================"
echo "  SKYESPORTS INVENTORY MANAGEMENT SYSTEM  v2.0"
echo "============================================================"
echo ""

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js not found. Install from: https://nodejs.org"
    exit 1
fi
echo "[OK] Node.js $(node -v) detected"

if [ ! -d "node_modules" ]; then
    echo ""
    echo "[SETUP] First-time setup: Installing dependencies..."
    npm install
    echo "[OK] Done!"
fi

# Get local IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "your-local-ip")
else
    IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "your-local-ip")
fi

echo ""
echo "============================================================"
echo " Open in browser:"
echo "   This PC  >  http://localhost:3000"
echo "   Network  >  http://$IP:3000"
echo ""
echo " Login: admin / pass"
echo " Share the Network URL with your team on same WiFi!"
echo "============================================================"
echo ""

# Auto-open browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    (sleep 3 && open "http://localhost:3000") &
elif command -v xdg-open &> /dev/null; then
    (sleep 3 && xdg-open "http://localhost:3000") &
fi

node server.js
