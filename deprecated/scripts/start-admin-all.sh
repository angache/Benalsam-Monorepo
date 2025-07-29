#!/bin/bash

# Admin Backend + UI Birlikte Başlatma Scripti
# Kullanım: ./start-admin-all.sh

echo "🚀 Admin Sistemi (Backend + UI) başlatılıyor..."
echo ""

# Backend'i arka planda başlat
echo "🔧 Backend başlatılıyor (Port: 3002)..."
cd packages/admin-backend

# Environment kontrol
if [ ! -f .env ]; then
    echo "⚠️  Backend .env dosyası bulunamadı!"
    echo "📝 Lütfen packages/admin-backend/.env.example dosyasını .env olarak kopyalayın."
    exit 1
fi

# Node modules kontrol
if [ ! -d "node_modules" ]; then
    echo "📦 Backend node modules yükleniyor..."
    npm install
fi

# Backend'i arka planda başlat
npm run dev &
BACKEND_PID=$!

# Ana dizine geri dön
cd ../..

# UI'ı başlat
echo "🎨 UI başlatılıyor (Port: 3003)..."
cd packages/admin-ui

# Node modules kontrol
if [ ! -d "node_modules" ]; then
    echo "📦 UI node modules yükleniyor..."
    npm install
fi

# UI'ı başlat
npm run dev &
UI_PID=$!

# Ana dizine geri dön
cd ../..

echo ""
echo "✅ Admin sistemi başlatıldı!"
echo "📊 Backend Health Check: http://localhost:3002/health"
echo "🌐 Admin Panel: http://localhost:3003"
echo "🔑 Login: admin@benalsam.com / admin123"
echo ""
echo "🛑 Durdurmak için: ./stop-admin-all.sh"
echo ""

# Process'leri bekle
wait $BACKEND_PID $UI_PID 