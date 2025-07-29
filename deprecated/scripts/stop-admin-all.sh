#!/bin/bash

# Admin Sistemi Durdurma Scripti
# Kullanım: ./stop-admin-all.sh

echo "🛑 Admin sistemi durduruluyor..."

# Port 3002'deki process'i bul ve durdur
BACKEND_PID=$(lsof -ti:3002)
if [ ! -z "$BACKEND_PID" ]; then
    echo "🔧 Backend durduruluyor (PID: $BACKEND_PID)..."
    kill -9 $BACKEND_PID
    echo "✅ Backend durduruldu."
else
    echo "ℹ️  Backend zaten durmuş."
fi

# Port 3003'teki process'i bul ve durdur
UI_PID=$(lsof -ti:3003)
if [ ! -z "$UI_PID" ]; then
    echo "🎨 UI durduruluyor (PID: $UI_PID)..."
    kill -9 $UI_PID
    echo "✅ UI durduruldu."
else
    echo "ℹ️  UI zaten durmuş."
fi

echo ""
echo "✅ Admin sistemi tamamen durduruldu!"
echo "🚀 Yeniden başlatmak için: ./start-admin-all.sh" 