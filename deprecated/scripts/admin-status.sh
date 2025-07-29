#!/bin/bash

# Admin Sistemi Durum Kontrol Scripti
# Kullanım: ./admin-status.sh

echo "📊 Admin Sistemi Durum Kontrolü"
echo "================================"

# Backend durumu
echo ""
echo "🔧 Backend Durumu:"
BACKEND_PID=$(lsof -ti:3002)
if [ ! -z "$BACKEND_PID" ]; then
    echo "✅ Çalışıyor (PID: $BACKEND_PID)"
    echo "📊 Health Check: http://localhost:3002/health"
else
    echo "❌ Durmuş"
fi

# UI durumu
echo ""
echo "🎨 UI Durumu:"
UI_PID=$(lsof -ti:3003)
if [ ! -z "$UI_PID" ]; then
    echo "✅ Çalışıyor (PID: $UI_PID)"
    echo "🌐 Admin Panel: http://localhost:3003"
else
    echo "❌ Durmuş"
fi

# Port durumları
echo ""
echo "🔌 Port Durumları:"
echo "Port 3002 (Backend): $(lsof -i:3002 > /dev/null 2>&1 && echo "✅ Açık" || echo "❌ Kapalı")"
echo "Port 3003 (UI): $(lsof -i:3003 > /dev/null 2>&1 && echo "✅ Açık" || echo "❌ Kapalı")"

echo ""
echo "📋 Kullanılabilir Komutlar:"
echo "🚀 ./start-admin-backend.sh  - Sadece backend başlat"
echo "🎨 ./start-admin-ui.sh       - Sadece UI başlat"
echo "🚀 ./start-admin-all.sh      - Her ikisini birlikte başlat"
echo "🛑 ./stop-admin-all.sh       - Her ikisini durdur" 