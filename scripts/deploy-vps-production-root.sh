#!/bin/bash

# VPS Production Deployment Script - ROOT VERSION
# Bu script VPS'de root olarak production deployment yapar

set -e

echo "🚀 VPS Production Deployment (ROOT) Başlıyor..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="benalsam"
COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env"

echo -e "${YELLOW}🔐 Root olarak çalışıyorsunuz - Güvenlik uyarısı!${NC}"

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ .env dosyası bulunamadı!${NC}"
    echo -e "${YELLOW}📝 .env dosyası oluşturuluyor...${NC}"
    cp env.consolidated.example .env
    echo -e "${YELLOW}⚠️  Lütfen .env dosyasını düzenleyin ve production değerlerini girin!${NC}"
    echo -e "${YELLOW}   Örnek: nano .env${NC}"
    read -p "Devam etmek için Enter'a basın..."
fi

# Check if production compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}❌ $COMPOSE_FILE dosyası bulunamadı!${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Pre-flight checks...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker bulunamadı! Kuruluyor...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose bulunamadı! Kuruluyor...${NC}"
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Check available memory
TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
if [ "$TOTAL_MEM" -lt 2048 ]; then
    echo -e "${YELLOW}⚠️  Düşük RAM: ${TOTAL_MEM}MB (Minimum 2GB önerilir)${NC}"
    read -p "Devam etmek için Enter'a basın..."
fi

# Check available disk space
DISK_SPACE=$(df -BG . | awk 'NR==2{print $4}' | sed 's/G//')
if [ "$DISK_SPACE" -lt 10 ]; then
    echo -e "${YELLOW}⚠️  Düşük disk alanı: ${DISK_SPACE}GB (Minimum 10GB önerilir)${NC}"
    read -p "Devam etmek için Enter'a basın..."
fi

echo -e "${GREEN}✅ Pre-flight checks tamamlandı${NC}"

# Stop existing containers
echo -e "${YELLOW}🛑 Mevcut container'ları durduruyorum...${NC}"
docker-compose -f $COMPOSE_FILE down --remove-orphans || true

# Clean up old images
echo -e "${YELLOW}🧹 Eski Docker image'larını temizliyorum...${NC}"
docker system prune -f

# Build and start services
echo -e "${YELLOW}🔨 Production build başlıyor...${NC}"
docker-compose -f $COMPOSE_FILE build --no-cache

echo -e "${YELLOW}🚀 Production services başlatılıyor...${NC}"
docker-compose -f $COMPOSE_FILE up -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Services sağlık kontrolü bekleniyor...${NC}"
sleep 30

# Check service health
echo -e "${YELLOW}🏥 Service health kontrolü...${NC}"

# Check Redis
if docker-compose -f $COMPOSE_FILE exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis: Healthy${NC}"
else
    echo -e "${RED}❌ Redis: Unhealthy${NC}"
fi

# Check Elasticsearch
if curl -f http://localhost:9200/_cluster/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Elasticsearch: Healthy${NC}"
else
    echo -e "${RED}❌ Elasticsearch: Unhealthy${NC}"
fi

# Check Admin Backend
if curl -f http://localhost:3002/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Admin Backend: Healthy${NC}"
else
    echo -e "${RED}❌ Admin Backend: Unhealthy${NC}"
fi

# Check Admin UI
if curl -f http://localhost:3003 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Admin UI: Healthy${NC}"
else
    echo -e "${RED}❌ Admin UI: Unhealthy${NC}"
fi

# Check Web
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Web: Healthy${NC}"
else
    echo -e "${RED}❌ Web: Unhealthy${NC}"
fi

# Show running containers
echo -e "${YELLOW}📊 Çalışan container'lar:${NC}"
docker-compose -f $COMPOSE_FILE ps

# Show resource usage
echo -e "${YELLOW}📈 Resource kullanımı:${NC}"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

echo -e "${GREEN}🎉 VPS Production Deployment (ROOT) tamamlandı!${NC}"
echo -e "${YELLOW}🌐 Servisler:${NC}"
echo -e "   Web: http://localhost:80"
echo -e "   Admin UI: http://localhost:3003"
echo -e "   Admin Backend: http://localhost:3002"
echo -e "   Elasticsearch: http://localhost:9200"
echo -e "   Redis: localhost:6379"

echo -e "${YELLOW}📝 Logları görmek için:${NC}"
echo -e "   docker-compose -f $COMPOSE_FILE logs -f"

echo -e "${YELLOW}🔧 Yönetim komutları:${NC}"
echo -e "   Durdur: docker-compose -f $COMPOSE_FILE down"
echo -e "   Yeniden başlat: docker-compose -f $COMPOSE_FILE restart"
echo -e "   Güncelle: docker-compose -f $COMPOSE_FILE pull && docker-compose -f $COMPOSE_FILE up -d"
