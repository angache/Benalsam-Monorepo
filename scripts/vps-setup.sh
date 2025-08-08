#!/bin/bash

# ===== BENALSAM VPS SETUP SCRIPT =====
# Bu script VPS'e hybrid system kurar

set -e  # Hata durumunda dur

echo "🚀 Benalsam VPS Setup başlıyor..."

# ===== PHASE 1: SYSTEM PREPARATION =====
echo "📦 Sistem paketleri güncelleniyor..."
sudo apt update && sudo apt upgrade -y

echo "🐳 Docker kuruluyor..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

echo "📦 Node.js kuruluyor..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 18
nvm use 18

echo "⚡ PM2 kuruluyor..."
npm install -g pm2

echo "📁 Proje dizini oluşturuluyor..."
sudo mkdir -p /var/www/benalsam
sudo chown $USER:$USER /var/www/benalsam
cd /var/www/benalsam

echo "📥 Proje indiriliyor..."
git clone https://github.com/angache/Benalsam-Monorepo.git .

# ===== PHASE 2: DOCKER INFRASTRUCTURE =====
echo "🐳 Docker servisleri başlatılıyor..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Servislerin başlaması bekleniyor..."
sleep 30

# ===== PHASE 3: PM2 APPLICATIONS =====
echo "⚡ PM2 servisleri başlatılıyor..."
cd /var/www/benalsam
pm2 start ecosystem.config.js

echo "💾 PM2 startup script kaydediliyor..."
pm2 save
pm2 startup

# ===== PHASE 4: FIREWALL =====
echo "🔥 Firewall ayarlanıyor..."
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3002  # Admin Backend
sudo ufw allow 3003  # Admin UI
sudo ufw allow 5173  # Web App
sudo ufw allow 6379  # Redis
sudo ufw allow 9200  # Elasticsearch
sudo ufw enable

# ===== PHASE 5: VERIFICATION =====
echo "✅ Kurulum tamamlandı!"
echo ""
echo "📊 Durum kontrolü:"
echo "🐳 Docker servisleri:"
docker ps
echo ""
echo "⚡ PM2 servisleri:"
pm2 status
echo ""
echo "🌐 Erişim URL'leri:"
echo "Admin Backend: http://209.227.228.96:3002"
echo "Admin UI: http://209.227.228.96:3003"
echo "Web App: http://209.227.228.96:5173"
echo "Elasticsearch: http://209.227.228.96:9200"
echo ""
echo "📝 Logları kontrol etmek için:"
echo "PM2 logs: pm2 logs"
echo "Docker logs: docker-compose -f docker-compose.prod.yml logs"
