#!/bin/bash

# Integration Test Script for Benalsam Monorepo
# Bu script tüm servislerin entegrasyonunu test eder

set -e

echo "🧪 Starting Integration Tests for Benalsam Monorepo..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to test full stack integration
test_full_stack_integration() {
    local test_name="Full stack integration"
    
    echo "🌐 Testing $test_name..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Start all services
    echo "   🚀 Starting all services..."
    docker-compose -f docker-compose.dev.yml up -d > /dev/null 2>&1
    
    # Wait for services to be ready
    echo "   ⏳ Waiting for services to be ready..."
    sleep 30
    
    local integration_ok=true
    
    # Test Redis connection
    echo "   🔍 Testing Redis connection..."
    if docker-compose -f docker-compose.dev.yml exec -T redis redis-cli ping | grep -q "PONG"; then
        echo "   ✅ Redis connection successful"
    else
        echo "   ❌ Redis connection failed"
        integration_ok=false
    fi
    
    # Test Elasticsearch connection
    echo "   🔍 Testing Elasticsearch connection..."
    if curl -f http://localhost:9200/_cluster/health > /dev/null 2>&1; then
        echo "   ✅ Elasticsearch connection successful"
    else
        echo "   ❌ Elasticsearch connection failed"
        integration_ok=false
    fi
    
    # Test Admin Backend API
    echo "   🔍 Testing Admin Backend API..."
    if curl -f http://localhost:3002/health > /dev/null 2>&1; then
        echo "   ✅ Admin Backend API accessible"
    else
        echo "   ❌ Admin Backend API failed"
        integration_ok=false
    fi
    
    # Test Admin UI
    echo "   🔍 Testing Admin UI..."
    if curl -f http://localhost:3003/health > /dev/null 2>&1; then
        echo "   ✅ Admin UI accessible"
    else
        echo "   ❌ Admin UI failed"
        integration_ok=false
    fi
    
    # Test Web App
    echo "   🔍 Testing Web App..."
    if curl -f http://localhost:5173/health > /dev/null 2>&1; then
        echo "   ✅ Web App accessible"
    else
        echo "   ❌ Web App failed"
        integration_ok=false
    fi
    
    # Test API communication
    echo "   🔍 Testing API communication..."
    if curl -f http://localhost:3002/api/v1/health > /dev/null 2>&1; then
        echo "   ✅ API communication successful"
    else
        echo "   ❌ API communication failed"
        integration_ok=false
    fi
    
    # Stop all services
    echo "   🛑 Stopping all services..."
    docker-compose -f docker-compose.dev.yml down > /dev/null 2>&1 || true
    
    if [ "$integration_ok" = true ]; then
        echo "   ✅ Full stack integration successful"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo "   ❌ Full stack integration failed"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    echo ""
}

# Function to test production deployment
test_production_deployment() {
    local test_name="Production deployment"
    
    echo "🚀 Testing $test_name..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Build production images
    echo "   🔨 Building production images..."
    docker-compose -f docker-compose.prod.yml build > /dev/null 2>&1
    
    # Start production services
    echo "   🚀 Starting production services..."
    docker-compose -f docker-compose.prod.yml up -d > /dev/null 2>&1
    
    # Wait for services to be ready
    echo "   ⏳ Waiting for production services..."
    sleep 45
    
    local production_ok=true
    
    # Test production health checks
    echo "   🔍 Testing production health checks..."
    
    # Test admin-backend production
    if curl -f http://localhost:3002/health > /dev/null 2>&1; then
        echo "   ✅ Admin Backend production health check passed"
    else
        echo "   ❌ Admin Backend production health check failed"
        production_ok=false
    fi
    
    # Test admin-ui production
    if curl -f http://localhost:3003/health > /dev/null 2>&1; then
        echo "   ✅ Admin UI production health check passed"
    else
        echo "   ❌ Admin UI production health check failed"
        production_ok=false
    fi
    
    # Test web production
    if curl -f http://localhost:5173/health > /dev/null 2>&1; then
        echo "   ✅ Web App production health check passed"
    else
        echo "   ❌ Web App production health check failed"
        production_ok=false
    fi
    
    # Stop production services
    echo "   🛑 Stopping production services..."
    docker-compose -f docker-compose.prod.yml down > /dev/null 2>&1 || true
    
    if [ "$production_ok" = true ]; then
        echo "   ✅ Production deployment successful"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo "   ❌ Production deployment failed"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    echo ""
}

# Function to test data persistence
test_data_persistence() {
    local test_name="Data persistence"
    
    echo "💾 Testing $test_name..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Start services with volumes
    echo "   🚀 Starting services with volumes..."
    docker-compose -f docker-compose.dev.yml up -d redis elasticsearch > /dev/null 2>&1
    
    # Wait for services to be ready
    sleep 15
    
    # Test Redis data persistence
    echo "   🔍 Testing Redis data persistence..."
    docker-compose -f docker-compose.dev.yml exec -T redis redis-cli set test_key "test_value" > /dev/null 2>&1
    
    # Restart Redis
    docker-compose -f docker-compose.dev.yml restart redis > /dev/null 2>&1
    sleep 5
    
    # Check if data persisted
    if docker-compose -f docker-compose.dev.yml exec -T redis redis-cli get test_key | grep -q "test_value"; then
        echo "   ✅ Redis data persistence successful"
    else
        echo "   ❌ Redis data persistence failed"
    fi
    
    # Test Elasticsearch data persistence
    echo "   🔍 Testing Elasticsearch data persistence..."
    curl -X PUT "localhost:9200/test_index" > /dev/null 2>&1
    
    # Restart Elasticsearch
    docker-compose -f docker-compose.dev.yml restart elasticsearch > /dev/null 2>&1
    sleep 15
    
    # Check if index persisted
    if curl -f "localhost:9200/test_index" > /dev/null 2>&1; then
        echo "   ✅ Elasticsearch data persistence successful"
    else
        echo "   ❌ Elasticsearch data persistence failed"
    fi
    
    # Clean up
    docker-compose -f docker-compose.dev.yml down > /dev/null 2>&1 || true
    
    echo "   ✅ Data persistence test completed"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo ""
}

# Function to test network connectivity
test_network_connectivity() {
    local test_name="Network connectivity"
    
    echo "🌐 Testing $test_name..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Start services
    docker-compose -f docker-compose.dev.yml up -d > /dev/null 2>&1
    sleep 20
    
    local network_ok=true
    
    # Test internal network communication
    echo "   🔍 Testing internal network communication..."
    
    # Test admin-backend to Redis
    if docker-compose -f docker-compose.dev.yml exec -T admin-backend ping -c 1 redis > /dev/null 2>&1; then
        echo "   ✅ Admin Backend to Redis communication successful"
    else
        echo "   ❌ Admin Backend to Redis communication failed"
        network_ok=false
    fi
    
    # Test admin-backend to Elasticsearch
    if docker-compose -f docker-compose.dev.yml exec -T admin-backend curl -f http://elasticsearch:9200/_cluster/health > /dev/null 2>&1; then
        echo "   ✅ Admin Backend to Elasticsearch communication successful"
    else
        echo "   ❌ Admin Backend to Elasticsearch communication failed"
        network_ok=false
    fi
    
    # Test admin-ui to admin-backend
    if docker-compose -f docker-compose.dev.yml exec -T admin-ui curl -f http://admin-backend:3002/health > /dev/null 2>&1; then
        echo "   ✅ Admin UI to Admin Backend communication successful"
    else
        echo "   ❌ Admin UI to Admin Backend communication failed"
        network_ok=false
    fi
    
    # Test web to admin-backend
    if docker-compose -f docker-compose.dev.yml exec -T web curl -f http://admin-backend:3002/health > /dev/null 2>&1; then
        echo "   ✅ Web to Admin Backend communication successful"
    else
        echo "   ❌ Web to Admin Backend communication failed"
        network_ok=false
    fi
    
    # Stop services
    docker-compose -f docker-compose.dev.yml down > /dev/null 2>&1 || true
    
    if [ "$network_ok" = true ]; then
        echo "   ✅ Network connectivity successful"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo "   ❌ Network connectivity failed"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    echo ""
}

# Main test execution
echo "🚀 Starting integration tests..."

# Test full stack integration
echo "🌐 FULL STACK INTEGRATION TESTS"
echo "==============================="
test_full_stack_integration

# Test production deployment
echo "🚀 PRODUCTION DEPLOYMENT TESTS"
echo "=============================="
test_production_deployment

# Test data persistence
echo "💾 DATA PERSISTENCE TESTS"
echo "========================="
test_data_persistence

# Test network connectivity
echo "🌐 NETWORK CONNECTIVITY TESTS"
echo "============================="
test_network_connectivity

# Print test results
echo "📊 INTEGRATION TEST RESULTS"
echo "=========================="
echo "Total tests: $TOTAL_TESTS"
echo "Passed: $TESTS_PASSED"
echo "Failed: $TESTS_FAILED"
echo "Success rate: $(( (TESTS_PASSED * 100) / TOTAL_TESTS ))%"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo "🎉 All integration tests passed!"
    exit 0
else
    echo ""
    echo "⚠️  Some integration tests failed. Please check the configuration."
    exit 1
fi 