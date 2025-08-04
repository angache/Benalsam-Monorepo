#!/bin/bash

# Docker Build Test Script for Benalsam Monorepo
# Bu script tüm Docker image'larının build'ini test eder

set -e

echo "🧪 Starting Docker Build Tests for Benalsam Monorepo..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to test Docker build
test_docker_build() {
    local dockerfile_path=$1
    local target=$2
    local service_name=$3
    local test_name="$service_name ($target)"
    
    echo "🔨 Testing build: $test_name..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Build the image
    if docker build -f $dockerfile_path --target $target -t benalsam-$service_name:test . > /dev/null 2>&1; then
        echo "✅ PASS: $test_name build successful"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        
        # Check if image was created
        if docker images benalsam-$service_name:test | grep -q "benalsam-$service_name"; then
            echo "   📦 Image created successfully"
        else
            echo "   ⚠️  Image not found after build"
        fi
        
        # Clean up
        docker rmi benalsam-$service_name:test > /dev/null 2>&1 || true
    else
        echo "❌ FAIL: $test_name build failed"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    echo ""
}

# Function to test multi-stage builds
test_multi_stage_build() {
    local dockerfile_path=$1
    local service_name=$2
    
    echo "🏗️  Testing multi-stage build: $service_name..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Test all stages
    local stages=("development" "builder" "production")
    local stage_failed=false
    
    for stage in "${stages[@]}"; do
        if docker build -f $dockerfile_path --target $stage -t benalsam-$service_name:$stage . > /dev/null 2>&1; then
            echo "   ✅ $stage stage: PASS"
        else
            echo "   ❌ $stage stage: FAIL"
            stage_failed=true
        fi
    done
    
    if [ "$stage_failed" = false ]; then
        echo "✅ PASS: $service_name multi-stage build successful"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo "❌ FAIL: $service_name multi-stage build failed"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    # Clean up
    for stage in "${stages[@]}"; do
        docker rmi benalsam-$service_name:$stage > /dev/null 2>&1 || true
    done
    
    echo ""
}

# Function to test cache optimization
test_cache_optimization() {
    local dockerfile_path=$1
    local target=$2
    local service_name=$3
    
    echo "🔄 Testing cache optimization: $service_name..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # First build (should be slower)
    echo "   🔨 First build..."
    start_time=$(date +%s.%N)
    docker build -f $dockerfile_path --target $target -t benalsam-$service_name:cache-test .
    first_build_time=$(echo "$(date +%s.%N) - $start_time" | bc)
    
    # Second build (should be faster due to cache)
    echo "   🔄 Second build (with cache)..."
    start_time=$(date +%s.%N)
    docker build -f $dockerfile_path --target $target -t benalsam-$service_name:cache-test .
    second_build_time=$(echo "$(date +%s.%N) - $start_time" | bc)
    
    # Check if second build was faster
    if (( $(echo "$second_build_time < $first_build_time" | bc -l) )); then
        echo "✅ PASS: Cache optimization working"
        echo "   First build: ${first_build_time}s"
        echo "   Second build: ${second_build_time}s"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo "❌ FAIL: Cache optimization not working"
        echo "   First build: ${first_build_time}s"
        echo "   Second build: ${second_build_time}s"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    # Clean up
    docker rmi benalsam-$service_name:cache-test > /dev/null 2>&1 || true
    echo ""
}

# Function to test image size
test_image_size() {
    local dockerfile_path=$1
    local target=$2
    local service_name=$3
    local max_size_mb=$4
    
    echo "📏 Testing image size: $service_name ($target)..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Build image
    docker build -f $dockerfile_path --target $target -t benalsam-$service_name:size-test .
    
    # Get image size in MB
    image_size_str=$(docker images benalsam-$service_name:size-test --format "{{.Size}}" | tail -1)
    image_size_mb=$(echo $image_size_str | sed 's/MB//' | sed 's/GB/*1024/' | bc)
    
    if (( $(echo "$image_size_mb <= $max_size_mb" | bc -l) )); then
        echo "✅ PASS: Image size within limits"
        echo "   Size: ${image_size_str} (max: ${max_size_mb}MB)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo "❌ FAIL: Image size too large"
        echo "   Size: ${image_size_str} (max: ${max_size_mb}MB)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    # Clean up
    docker rmi benalsam-$service_name:size-test > /dev/null 2>&1 || true
    echo ""
}

# Main test execution
echo "🚀 Starting Docker build tests..."

# Test basic builds
echo "📋 BASIC BUILD TESTS"
echo "===================="

test_docker_build "packages/admin-backend/Dockerfile" "development" "admin-backend"
test_docker_build "packages/admin-backend/Dockerfile" "production" "admin-backend"
test_docker_build "packages/admin-ui/Dockerfile" "development" "admin-ui"
test_docker_build "packages/admin-ui/Dockerfile" "production" "admin-ui"
test_docker_build "packages/web/Dockerfile" "development" "web"
test_docker_build "packages/web/Dockerfile" "production" "web"

# Test multi-stage builds
echo "🏗️  MULTI-STAGE BUILD TESTS"
echo "==========================="

test_multi_stage_build "packages/admin-backend/Dockerfile" "admin-backend"
test_multi_stage_build "packages/admin-ui/Dockerfile" "admin-ui"
test_multi_stage_build "packages/web/Dockerfile" "web"

# Test cache optimization
echo "🔄 CACHE OPTIMIZATION TESTS"
echo "==========================="

test_cache_optimization "packages/admin-backend/Dockerfile" "development" "admin-backend"
test_cache_optimization "packages/admin-ui/Dockerfile" "development" "admin-ui"
test_cache_optimization "packages/web/Dockerfile" "development" "web"

# Test image sizes
echo "📏 IMAGE SIZE TESTS"
echo "==================="

test_image_size "packages/admin-backend/Dockerfile" "development" "admin-backend" 200
test_image_size "packages/admin-backend/Dockerfile" "production" "admin-backend" 100
test_image_size "packages/admin-ui/Dockerfile" "development" "admin-ui" 200
test_image_size "packages/admin-ui/Dockerfile" "production" "admin-ui" 50
test_image_size "packages/web/Dockerfile" "development" "web" 200
test_image_size "packages/web/Dockerfile" "production" "web" 50

# Print test results
echo "📊 TEST RESULTS"
echo "==============="
echo "Total tests: $TOTAL_TESTS"
echo "Passed: $TESTS_PASSED"
echo "Failed: $TESTS_FAILED"
echo "Success rate: $(( (TESTS_PASSED * 100) / TOTAL_TESTS ))%"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo "🎉 All tests passed!"
    exit 0
else
    echo ""
    echo "⚠️  Some tests failed. Please check the build configurations."
    exit 1
fi 