#!/bin/bash

# ===== DOCKER CACHE MANAGER =====
# Docker build cache optimization ve image layer management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CACHE_IMAGES=(
    "benalsam-admin-backend:cache"
    "benalsam-admin-ui:cache"
    "benalsam-web:cache"
)

# Log function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Success function
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Warning function
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Error function
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Info function
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        error "Docker is not running or not accessible"
        exit 1
    fi
    success "Docker is running"
}

# Create cache images
create_cache_images() {
    info "Creating cache images for build optimization..."
    
    for cache_image in "${CACHE_IMAGES[@]}"; do
        local service_name=$(echo "$cache_image" | sed 's/benalsam-\(.*\):cache/\1/')
        
        info "Creating cache image for $service_name..."
        
        # Create a minimal cache image with dependencies
        docker build \
            --target deps \
            --cache-from "$cache_image" \
            --tag "$cache_image" \
            --file "packages/$service_name/Dockerfile" \
            . 2>/dev/null || {
            warning "Failed to create cache image for $service_name, creating empty one..."
            
            # Create empty cache image if build fails
            docker build \
                --build-arg BUILDKIT_INLINE_CACHE=1 \
                --tag "$cache_image" \
                --file - . <<EOF
FROM alpine:latest
LABEL cache=true
EOF
        }
        
        success "Cache image created: $cache_image"
    done
}

# Build with cache optimization
build_with_cache() {
    local service=$1
    local cache_image="benalsam-$service:cache"
    
    info "Building $service with cache optimization..."
    
    docker build \
        --cache-from "$cache_image" \
        --tag "benalsam-$service:latest" \
        --file "packages/$service/Dockerfile" \
        . || {
        error "Failed to build $service"
        return 1
    }
    
    # Update cache image
    docker tag "benalsam-$service:latest" "$cache_image"
    success "Built $service and updated cache"
}

# Build all services with cache
build_all_services() {
    info "Building all services with cache optimization..."
    
    local services=("admin-backend" "admin-ui" "web")
    
    for service in "${services[@]}"; do
        build_with_cache "$service"
        echo
    done
    
    success "All services built with cache optimization"
}

# Clean up old cache images
cleanup_cache() {
    info "Cleaning up old cache images..."
    
    # Remove cache images older than 7 days
    local old_cache_images=$(docker images --filter "label=cache=true" --format "{{.Repository}}:{{.Tag}}" | grep "cache$")
    
    if [ -n "$old_cache_images" ]; then
        echo "$old_cache_images" | while read -r image; do
            local image_age=$(docker images --format "{{.CreatedAt}}" "$image" | awk '{print $1}')
            local days_old=$(( ( $(date +%s) - $(date -d "$image_age" +%s) ) / 86400 ))
            
            if [ "$days_old" -gt 7 ]; then
                info "Removing old cache image: $image (age: ${days_old} days)"
                docker rmi "$image" 2>/dev/null || warning "Failed to remove $image"
            fi
        done
    else
        info "No old cache images found"
    fi
    
    success "Cache cleanup completed"
}

# Show cache status
show_cache_status() {
    info "=== CACHE STATUS ==="
    
    echo "Cache Images:"
    for cache_image in "${CACHE_IMAGES[@]}"; do
        if docker images "$cache_image" | grep -q "$cache_image"; then
            local size=$(docker images "$cache_image" --format "{{.Size}}")
            local created=$(docker images "$cache_image" --format "{{.CreatedAt}}")
            success "  $cache_image - Size: $size, Created: $created"
        else
            warning "  $cache_image - Not found"
        fi
    done
    
    echo
    echo "Build Cache Usage:"
    local build_cache_size=$(docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}" | grep "Build Cache" | awk '{print $3}')
    echo "  Build Cache: $build_cache_size"
    
    echo
    echo "Docker System Info:"
    docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}\t{{.Reclaimable}}"
}

# Optimize Docker build context
optimize_build_context() {
    info "Optimizing Docker build context..."
    
    # Check if .dockerignore exists
    if [ ! -f ".dockerignore" ]; then
        warning ".dockerignore file not found, creating optimized one..."
        create_dockerignore
    fi
    
    # Check build context size
    local context_size=$(du -sh . | cut -f1)
    info "Current build context size: $context_size"
    
    # Show what's included in build context
    info "Files included in build context:"
    find . -type f -not -path "./node_modules/*" -not -path "./.git/*" | head -20 | while read -r file; do
        echo "  $file"
    done
    
    if [ $(find . -type f -not -path "./node_modules/*" -not -path "./.git/*" | wc -l) -gt 20 ]; then
        echo "  ... and more files"
    fi
}

# Create optimized .dockerignore
create_dockerignore() {
    info "Creating optimized .dockerignore file..."
    
    cat > .dockerignore << 'EOF'
# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Build outputs
dist
dist-esm
build
.next
.nuxt
out

# Environment files
.env
.env.local
.env.development
.env.production
.env.test

# Development files
.git
.gitignore
README.md
*.md
.vscode
.cursor
.idea

# OS files
.DS_Store
Thumbs.db

# Docker
Dockerfile*
docker-compose*
.dockerignore

# Logs
logs
*.log

# Testing
coverage
.nyc_output

# IDE
.vscode
.idea
*.swp
*.swo

# Temporary files
*.tmp
*.temp
.cache

# Documentation
docs/
*.md
!README.md

# Scripts
scripts/
tools/

# Backup files
*.backup
*.bak

# Misc
*.tsbuildinfo
EOF

    success "Optimized .dockerignore created"
}

# Build performance analysis
analyze_build_performance() {
    info "=== BUILD PERFORMANCE ANALYSIS ==="
    
    # Check Docker buildx support
    if docker buildx version >/dev/null 2>&1; then
        success "Docker Buildx is available"
        
        # Show available builders
        echo "Available builders:"
        docker buildx ls
        
        # Check if multi-platform builder exists
        if docker buildx ls | grep -q "multi-platform"; then
            success "Multi-platform builder found"
        else
            warning "Multi-platform builder not found, consider creating one for better performance"
        fi
    else
        warning "Docker Buildx not available, consider upgrading Docker"
    fi
    
    echo
    echo "Build optimization recommendations:"
    echo "  1. Use multi-stage builds (✅ Implemented)"
    echo "  2. Optimize .dockerignore (✅ Implemented)"
    echo "  3. Use build cache (✅ Implemented)"
    echo "  4. Consider Buildx for parallel builds"
    echo "  5. Use .dockerignore effectively"
}

# Main function
main() {
    log "Starting Docker Cache Manager..."
    echo
    
    check_docker
    echo
    
    case "${1:-}" in
        "create-cache")
            create_cache_images
            ;;
        "build")
            if [ -n "$2" ]; then
                build_with_cache "$2"
            else
                build_all_services
            fi
            ;;
        "cleanup")
            cleanup_cache
            ;;
        "status")
            show_cache_status
            ;;
        "optimize")
            optimize_build_context
            ;;
        "analyze")
            analyze_build_performance
            ;;
        "all")
            create_cache_images
            echo
            build_all_services
            echo
            show_cache_status
            ;;
        *)
            echo "Docker Cache Manager"
            echo "Usage: $0 [COMMAND] [SERVICE]"
            echo
            echo "Commands:"
            echo "  create-cache           Create cache images for all services"
            echo "  build [SERVICE]        Build service with cache optimization"
            echo "  cleanup                Clean up old cache images"
            echo "  status                 Show cache status"
            echo "  optimize               Optimize build context"
            echo "  analyze                Analyze build performance"
            echo "  all                    Run all optimizations"
            echo
            echo "Examples:"
            echo "  $0 create-cache        # Create cache images"
            echo "  $0 build admin-backend # Build specific service"
            echo "  $0 build               # Build all services"
            echo "  $0 all                 # Run all optimizations"
            ;;
    esac
}

# Run main function
main "$@"
