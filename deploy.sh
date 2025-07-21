#!/bin/bash

# Benalsam Production Deployment Script
set -e

echo "🚀 Starting Benalsam Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="benalsam"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose file exists
if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
    print_error "Docker Compose file not found: $DOCKER_COMPOSE_FILE"
    exit 1
fi

# Check if production env file exists
if [ ! -f "packages/admin-backend/.env.production" ]; then
    print_warning "Production environment file not found. Creating from template..."
    cp packages/admin-backend/env.production.example packages/admin-backend/.env.production
    print_warning "Please edit packages/admin-backend/.env.production with your production values"
    exit 1
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f $DOCKER_COMPOSE_FILE down --remove-orphans

# Remove old images
print_status "Removing old images..."
docker system prune -f

# Build new images
print_status "Building new images..."
docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache

# Start services
print_status "Starting services..."
docker-compose -f $DOCKER_COMPOSE_FILE up -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service health
print_status "Checking service health..."

# Check admin-backend
if docker-compose -f $DOCKER_COMPOSE_FILE exec -T admin-backend node -e "require('http').get('http://localhost:3002/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" 2>/dev/null; then
    print_status "✅ Admin Backend is healthy"
else
    print_error "❌ Admin Backend health check failed"
fi

# Check admin-ui
if docker-compose -f $DOCKER_COMPOSE_FILE exec -T admin-ui wget --no-verbose --tries=1 --spider http://localhost:80/ 2>/dev/null; then
    print_status "✅ Admin UI is healthy"
else
    print_error "❌ Admin UI health check failed"
fi

# Check nginx
if docker-compose -f $DOCKER_COMPOSE_FILE exec -T nginx wget --no-verbose --tries=1 --spider http://localhost:80/health 2>/dev/null; then
    print_status "✅ Nginx is healthy"
else
    print_error "❌ Nginx health check failed"
fi

# Show running containers
print_status "Running containers:"
docker-compose -f $DOCKER_COMPOSE_FILE ps

# Show logs
print_status "Recent logs:"
docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=20

print_status "🎉 Deployment completed successfully!"
print_status "📊 Services available at:"
print_status "   - Admin UI: http://localhost"
print_status "   - Admin Backend API: http://localhost/api"
print_status "   - Health Check: http://localhost/health"

echo ""
print_status "Useful commands:"
echo "  View logs: docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
echo "  Stop services: docker-compose -f $DOCKER_COMPOSE_FILE down"
echo "  Restart services: docker-compose -f $DOCKER_COMPOSE_FILE restart"
echo "  Update services: ./deploy.sh" 