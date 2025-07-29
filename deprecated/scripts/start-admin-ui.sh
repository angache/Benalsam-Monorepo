#!/bin/bash

# Admin UI Başlatma Scripti
# Kullanım: ./start-admin-ui.sh

echo "🎨 Admin UI başlatılıyor..."

# Gerekli dizine git
cd packages/admin-ui

# Node modules kontrol et
if [ ! -d "node_modules" ]; then
    echo "📦 Node modules yükleniyor..."
    npm install
fi

# UI'ı başlat
echo "🎨 UI başlatılıyor (Port: 3003)..."
echo "🌐 Admin Panel: http://localhost:3003"
echo "🔑 Login: admin@benalsam.com / admin123"
echo ""
echo "🛑 Durdurmak için: Ctrl+C"
echo ""

npm run dev 