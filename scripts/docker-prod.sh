#!/bin/bash

# Production Docker Script for Benalsam Monorepo
# Bu script production environment'ı başlatır

set -e

echo "🚀 Starting Benalsam Production Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create .env file with production configuration."
    exit 1
fi

# Check if SSL certificates exist (for HTTPS)
if [ ! -f nginx/ssl/cert.pem ] || [ ! -f nginx/ssl/key.pem ]; then
    echo "⚠️  SSL certificates not found. Creating self-signed certificates..."
    mkdir -p nginx/ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=TR/ST=Istanbul/L=Istanbul/O=Benalsam/CN=localhost"
    echo "📝 Self-signed certificates created. For production, use proper SSL certificates."
fi

# Create nginx logs directory
mkdir -p nginx/logs

# Build and start production services
echo "🔨 Building production images..."
docker-compose -f docker-compose.prod.yml build

echo "🚀 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
docker-compose -f docker-compose.prod.yml ps

# Check if all services are healthy
echo "🔍 Checking service health status..."
for service in redis elasticsearch admin-backend admin-ui web nginx; do
    if docker-compose -f docker-compose.prod.yml ps $service | grep -q "healthy"; then
        echo "✅ $service is healthy"
    else
        echo "⚠️  $service health check failed"
    fi
done

echo "✅ Production environment is ready!"
echo ""
echo "📊 Service URLs:"
echo "   Main App:      http://localhost"
echo "   Admin UI:      http://localhost/admin"
echo "   API:           http://localhost/api"
echo "   Health Check:  http://localhost/health"
echo ""
echo "🔧 Useful commands:"
echo "   View logs:     docker-compose -f docker-compose.prod.yml logs -f"
echo "   Stop services: docker-compose -f docker-compose.prod.yml down"
echo "   Restart:       docker-compose -f docker-compose.prod.yml restart"
echo "   Scale:         docker-compose -f docker-compose.prod.yml up -d --scale admin-backend=2"
echo ""
echo "📈 Monitoring:"
echo "   Resource usage: docker stats"
echo "   Service logs:   docker-compose -f docker-compose.prod.yml logs -f [service-name]" 