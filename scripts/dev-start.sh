#!/bin/bash

# ===== DEVELOPMENT WORKFLOW SCRIPT =====

echo "🚀 Benalsam Development Workflow"

# Environment setup
if [ ! -f ".env" ]; then
    echo "📝 Environment dosyaları oluşturuluyor..."
    ./scripts/setup-env.sh
fi

# Dependencies install
echo "📦 Dependencies yükleniyor..."
pnpm install

# Start services
echo "🔧 Servisler başlatılıyor..."

# Terminal 1: Admin Backend
echo "🔧 Admin Backend başlatılıyor (Terminal 1)..."
cd packages/admin-backend
pnpm run dev &
ADMIN_BACKEND_PID=$!

# Terminal 2: Admin UI
echo "🔧 Admin UI başlatılıyor (Terminal 2)..."
cd ../admin-ui
pnpm run dev &
ADMIN_UI_PID=$!

# Terminal 3: Web
echo "🔧 Web başlatılıyor (Terminal 3)..."
cd ../web
pnpm run dev &
WEB_PID=$!

# Terminal 4: Mobile (opsiyonel)
echo "🔧 Mobile başlatılıyor (Terminal 4)..."
cd ../mobile
npx expo start &
MOBILE_PID=$!

echo "✅ Tüm servisler başlatıldı!"
echo "📱 Admin Backend: http://localhost:3002"
echo "📱 Admin UI: http://localhost:3003"
echo "📱 Web: http://localhost:5173"
echo "📱 Mobile: Expo DevTools"

# Wait for user input
echo "🛑 Servisleri durdurmak için Ctrl+C basın"
wait 