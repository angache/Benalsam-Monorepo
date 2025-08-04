#!/bin/bash

# VPS Deployment Script for Benalsam
# Usage: ./scripts/deploy-vps.sh

set -e

echo "🚀 Benalsam VPS Deployment Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found. Please create it from env.production.example"
    exit 1
fi

print_status "Starting VPS deployment..."

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Clean up old images
print_status "Cleaning up old images..."
docker system prune -f

# Build production images
print_status "Building production images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start production services
print_status "Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Check service health
print_status "Checking service health..."

# Check admin-backend
if curl -f http://localhost:3002/health > /dev/null 2>&1; then
    print_status "✅ Admin Backend is healthy"
else
    print_error "❌ Admin Backend health check failed"
    docker-compose -f docker-compose.prod.yml logs admin-backend
    exit 1
fi

# Check admin-ui
if curl -f http://localhost:3003/ > /dev/null 2>&1; then
    print_status "✅ Admin UI is running"
else
    print_error "❌ Admin UI health check failed"
    docker-compose -f docker-compose.prod.yml logs admin-ui
    exit 1
fi

# Check web app
if curl -f http://localhost:5173/ > /dev/null 2>&1; then
    print_status "✅ Web App is running"
else
    print_error "❌ Web App health check failed"
    docker-compose -f docker-compose.prod.yml logs web
    exit 1
fi

# Check Elasticsearch
if curl -f http://localhost:9200/ > /dev/null 2>&1; then
    print_status "✅ Elasticsearch is running"
else
    print_error "❌ Elasticsearch health check failed"
    docker-compose -f docker-compose.prod.yml logs elasticsearch
    exit 1
fi

# Check Redis
if docker-compose -f docker-compose.prod.yml exec redis redis-cli ping > /dev/null 2>&1; then
    print_status "✅ Redis is running"
else
    print_error "❌ Redis health check failed"
    docker-compose -f docker-compose.prod.yml logs redis
    exit 1
fi

# Show running containers
print_status "Current container status:"
docker-compose -f docker-compose.prod.yml ps

# Show resource usage
print_status "Resource usage:"
docker stats --no-stream

print_status "🎉 Deployment completed successfully!"
print_status "Services are now running:"
echo "  - Admin Backend: http://localhost:3002"
echo "  - Admin UI: http://localhost:3003"
echo "  - Web App: http://localhost:5173"
echo "  - Elasticsearch: http://localhost:9200"
echo "  - Redis: localhost:6379"

print_warning "Remember to:"
echo "  1. Configure your domain DNS"
echo "  2. Set up SSL certificates with Let's Encrypt"
echo "  3. Configure Nginx for production"
echo "  4. Set up monitoring and backups"

print_status "Deployment script completed!" 