#!/bin/bash

# Cache Performance Monitoring Script for Benalsam Monorepo
# Bu script build cache performance'ını ölçer

set -e

echo "⚡ Cache Performance Monitoring for Benalsam Monorepo..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Function to measure build time
measure_build_time() {
    local dockerfile_path=$1
    local target=$2
    local service_name=$3
    
    echo "🔨 Measuring build time for $service_name ($target)..."
    
    # Clear build cache for accurate measurement
    docker builder prune -f
    
    # Measure build time
    start_time=$(date +%s.%N)
    docker build -f $dockerfile_path --target $target -t benalsam-$service_name:test .
    end_time=$(date +%s.%N)
    
    build_time=$(echo "$end_time - $start_time" | bc)
    echo "⏱️  Build time for $service_name ($target): ${build_time}s"
    
    # Clean up
    docker rmi benalsam-$service_name:test > /dev/null 2>&1 || true
    
    return $build_time
}

# Function to measure cache hit rate
measure_cache_hit() {
    local dockerfile_path=$1
    local target=$2
    local service_name=$3
    
    echo "🔄 Measuring cache hit rate for $service_name..."
    
    # First build (cold cache)
    echo "❄️  Cold build..."
    start_time=$(date +%s.%N)
    docker build -f $dockerfile_path --target $target -t benalsam-$service_name:cache-test .
    cold_time=$(echo "$(date +%s.%N) - $start_time" | bc)
    
    # Second build (warm cache)
    echo "🔥 Warm build..."
    start_time=$(date +%s.%N)
    docker build -f $dockerfile_path --target $target -t benalsam-$service_name:cache-test .
    warm_time=$(echo "$(date +%s.%N) - $start_time" | bc)
    
    # Calculate cache hit rate
    if (( $(echo "$cold_time > 0" | bc -l) )); then
        cache_hit_rate=$(echo "scale=2; (($cold_time - $warm_time) / $cold_time) * 100" | bc)
        echo "📊 Cache hit rate for $service_name: ${cache_hit_rate}%"
        echo "   Cold build: ${cold_time}s"
        echo "   Warm build: ${warm_time}s"
    else
        echo "⚠️  Could not calculate cache hit rate for $service_name"
    fi
    
    # Clean up
    docker rmi benalsam-$service_name:cache-test > /dev/null 2>&1 || true
}

# Function to analyze layer cache
analyze_layer_cache() {
    local dockerfile_path=$1
    local service_name=$2
    
    echo "🔍 Analyzing layer cache for $service_name..."
    
    # Build with detailed output
    docker build -f $dockerfile_path --target production -t benalsam-$service_name:layer-test . 2>&1 | grep -E "(Step|Using cache|Pulling|Building)" | tail -20
    
    # Clean up
    docker rmi benalsam-$service_name:layer-test > /dev/null 2>&1 || true
}

# Function to check image size
check_image_size() {
    local dockerfile_path=$1
    local target=$2
    local service_name=$3
    
    echo "📏 Checking image size for $service_name ($target)..."
    
    # Build image
    docker build -f $dockerfile_path --target $target -t benalsam-$service_name:size-test .
    
    # Get image size
    image_size=$(docker images benalsam-$service_name:size-test --format "table {{.Size}}" | tail -1)
    echo "📦 Image size for $service_name ($target): $image_size"
    
    # Clean up
    docker rmi benalsam-$service_name:size-test > /dev/null 2>&1 || true
}

# Main performance measurement
echo "🚀 Starting performance measurements..."

# Measure build times
echo ""
echo "⏱️  BUILD TIME MEASUREMENTS"
echo "=========================="

measure_build_time "packages/admin-backend/Dockerfile" "development" "admin-backend"
measure_build_time "packages/admin-backend/Dockerfile" "production" "admin-backend"
measure_build_time "packages/admin-ui/Dockerfile" "development" "admin-ui"
measure_build_time "packages/admin-ui/Dockerfile" "production" "admin-ui"
measure_build_time "packages/web/Dockerfile" "development" "web"
measure_build_time "packages/web/Dockerfile" "production" "web"

# Measure cache hit rates
echo ""
echo "🔄 CACHE HIT RATE MEASUREMENTS"
echo "=============================="

measure_cache_hit "packages/admin-backend/Dockerfile" "development" "admin-backend"
measure_cache_hit "packages/admin-ui/Dockerfile" "development" "admin-ui"
measure_cache_hit "packages/web/Dockerfile" "development" "web"

# Analyze layer cache
echo ""
echo "🔍 LAYER CACHE ANALYSIS"
echo "======================="

analyze_layer_cache "packages/admin-backend/Dockerfile" "admin-backend"
analyze_layer_cache "packages/admin-ui/Dockerfile" "admin-ui"
analyze_layer_cache "packages/web/Dockerfile" "web"

# Check image sizes
echo ""
echo "📏 IMAGE SIZE ANALYSIS"
echo "====================="

check_image_size "packages/admin-backend/Dockerfile" "development" "admin-backend"
check_image_size "packages/admin-backend/Dockerfile" "production" "admin-backend"
check_image_size "packages/admin-ui/Dockerfile" "development" "admin-ui"
check_image_size "packages/admin-ui/Dockerfile" "production" "admin-ui"
check_image_size "packages/web/Dockerfile" "development" "web"
check_image_size "packages/web/Dockerfile" "production" "web"

# Docker system info
echo ""
echo "🐳 DOCKER SYSTEM INFO"
echo "===================="

echo "Docker version:"
docker --version

echo ""
echo "Docker buildx version:"
docker buildx version

echo ""
echo "Available disk space:"
df -h .

echo ""
echo "Docker system df:"
docker system df

echo ""
echo "✅ Performance monitoring completed!"
echo ""
echo "📊 Summary:"
echo "   - Build times measured for all services"
echo "   - Cache hit rates calculated"
echo "   - Layer cache analysis completed"
echo "   - Image sizes checked"
echo ""
echo "🔧 Recommendations:"
echo "   - Optimize slow builds"
echo "   - Improve cache hit rates"
echo "   - Reduce image sizes"
echo "   - Monitor regularly" 