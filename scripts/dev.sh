#!/bin/bash

# Benalsam Monorepo Development Script
# Bu script tüm servisleri başlatır

set -e

echo "🚀 Benalsam Monorepo Development Environment"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_success "Docker is running"
}

# Start Docker services
start_docker_services() {
    print_status "Starting Docker services (Redis, Elasticsearch)..."
    docker-compose -f docker-compose.dev.yml up -d redis elasticsearch
    print_success "Docker services started"
}

# Build shared-types
build_shared_types() {
    print_status "Building shared-types package..."
    cd packages/shared-types
    npm run build
    cd ../..
    print_success "Shared-types built successfully"
}

# Start development servers
start_dev_servers() {
    print_status "Starting development servers..."
    
    # Start admin-backend in background
    print_status "Starting admin-backend..."
    cd packages/admin-backend
    npm start &
    BACKEND_PID=$!
    cd ../..
    
    # Wait a bit for backend to start
    sleep 3
    
    # Start admin-ui in background
    print_status "Starting admin-ui..."
    cd packages/admin-ui
    npm run dev &
    UI_PID=$!
    cd ../..
    
    print_success "Development servers started"
    echo ""
    echo "📊 Services Status:"
    echo "  • Backend API: http://localhost:3002"
    echo "  • Admin UI: http://localhost:3003"
    echo "  • Redis: localhost:6379"
    echo "  • Elasticsearch: localhost:9200"
    echo ""
    echo "🛑 To stop all services, press Ctrl+C"
    
    # Wait for user to stop
    wait $BACKEND_PID $UI_PID
}

# Cleanup function
cleanup() {
    print_status "Stopping development servers..."
    kill $BACKEND_PID $UI_PID 2>/dev/null || true
    print_success "Development servers stopped"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    check_docker
    start_docker_services
    build_shared_types
    start_dev_servers
}

# Run main function
main "$@" 