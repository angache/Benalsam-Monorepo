#!/bin/bash

# Admin Backend Başlatma Scripti
# Kullanım: ./start-admin-backend.sh

echo "🚀 Admin Backend başlatılıyor..."

# Gerekli dizine git
cd packages/admin-backend

# Environment dosyasını kontrol et
if [ ! -f .env ]; then
    echo "⚠️  .env dosyası bulunamadı!"
    echo "📝 Lütfen .env.example dosyasını .env olarak kopyalayın ve gerekli değerleri doldurun."
    echo "   cp .env.example .env"
    exit 1
fi

# Node modules kontrol et
if [ ! -d "node_modules" ]; then
    echo "📦 Node modules yükleniyor..."
    npm install
fi

# Backend'i başlat
echo "🔧 Backend başlatılıyor (Port: 3002)..."
echo "📊 Health Check: http://localhost:3002/health"
echo "📚 API Docs: http://localhost:3002/api/v1"
echo ""
echo "🛑 Durdurmak için: Ctrl+C"
echo ""

npm run dev 