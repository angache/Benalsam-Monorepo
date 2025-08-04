#!/bin/bash

# Development Docker Script for Benalsam Monorepo
# Bu script development environment'ı başlatır

set -e

echo "🐳 Starting Benalsam Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please update .env file with your configuration."
fi

# Build and start development services
echo "🔨 Building development images..."
docker-compose -f docker-compose.dev.yml build 2>&1 | grep -v "importing cache manifest" || true

echo "🚀 Starting development services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo "🏥 Checking service health..."
docker-compose -f docker-compose.dev.yml ps

echo "✅ Development environment is ready!"
echo ""
echo "📊 Service URLs:"
echo "   Admin Backend: http://localhost:3002"
echo "   Admin UI:      http://localhost:3003"
echo "   Web App:       http://localhost:5173"
echo "   Redis:         localhost:6379"
echo "   Elasticsearch: http://localhost:9200"
echo ""
echo "🔧 Useful commands:"
echo "   View logs:     docker-compose -f docker-compose.dev.yml logs -f"
echo "   Stop services: docker-compose -f docker-compose.dev.yml down"
echo "   Restart:       docker-compose -f docker-compose.dev.yml restart"
echo ""
echo "📝 Hot reload is enabled for all services!" 