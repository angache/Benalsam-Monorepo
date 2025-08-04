#!/bin/bash

# Docker Compose Test Script for Benalsam Monorepo
# Bu script Docker Compose servislerini test eder

set -e

echo "🧪 Starting Docker Compose Tests for Benalsam Monorepo..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose."
    exit 1
fi

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to test service startup
test_service_startup() {
    local compose_file=$1
    local service_name=$2
    local test_name="Service startup: $service_name"
    
    echo "🚀 Testing $test_name..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Start the service
    if docker-compose -f $compose_file up -d $service_name > /dev/null 2>&1; then
        echo "   ✅ Service started successfully"
        
        # Wait for service to be ready
        sleep 10
        
        # Check if service is running
        if docker-compose -f $compose_file ps $service_name | grep -q "Up"; then
            echo "   ✅ Service is running"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo "   ❌ Service is not running"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
        
        # Stop the service
        docker-compose -f $compose_file down > /dev/null 2>&1 || true
    else
        echo "   ❌ Service failed to start"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    echo ""
}

# Function to test health checks
test_health_checks() {
    local compose_file=$1
    local service_name=$2
    local health_endpoint=$3
    local test_name="Health check: $service_name"
    
    echo "🏥 Testing $test_name..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Start the service
    docker-compose -f $compose_file up -d $service_name > /dev/null 2>&1
    
    # Wait for service to be ready
    sleep 15
    
    # Test health endpoint
    if curl -f $health_endpoint > /dev/null 2>&1; then
        echo "   ✅ Health check passed"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo "   ❌ Health check failed"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    # Stop the service
    docker-compose -f $compose_file down > /dev/null 2>&1 || true
    echo ""
}

# Function to test service communication
test_service_communication() {
    local compose_file=$1
    local test_name="Service communication"
    
    echo "🌐 Testing $test_name..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Start all services
    docker-compose -f $compose_file up -d > /dev/null 2>&1
    
    # Wait for services to be ready
    sleep 20
    
    # Test if services can communicate
    local communication_ok=true
    
    # Test admin-backend health
    if ! curl -f http://localhost:3002/health > /dev/null 2>&1; then
        echo "   ❌ Admin backend health check failed"
        communication_ok=false
    else
        echo "   ✅ Admin backend health check passed"
    fi
    
    # Test admin-ui health
    if ! curl -f http://localhost:3003/health > /dev/null 2>&1; then
        echo "   ❌ Admin UI health check failed"
        communication_ok=false
    else
        echo "   ✅ Admin UI health check passed"
    fi
    
    # Test web app health
    if ! curl -f http://localhost:5173/health > /dev/null 2>&1; then
        echo "   ❌ Web app health check failed"
        communication_ok=false
    else
        echo "   ✅ Web app health check passed"
    fi
    
    if [ "$communication_ok" = true ]; then
        echo "   ✅ All services communicating"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo "   ❌ Service communication failed"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    # Stop all services
    docker-compose -f $compose_file down > /dev/null 2>&1 || true
    echo ""
}

# Function to test environment variables
test_environment_variables() {
    local compose_file=$1
    local test_name="Environment variables"
    
    echo "🔧 Testing $test_name..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Check if .env file exists
    if [ -f .env ]; then
        echo "   ✅ .env file exists"
        
        # Check required environment variables
        local required_vars=("SUPABASE_URL" "SUPABASE_SERVICE_ROLE_KEY" "SUPABASE_ANON_KEY")
        local missing_vars=()
        
        for var in "${required_vars[@]}"; do
            if ! grep -q "^$var=" .env; then
                missing_vars+=("$var")
            fi
        done
        
        if [ ${#missing_vars[@]} -eq 0 ]; then
            echo "   ✅ All required environment variables present"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo "   ❌ Missing environment variables: ${missing_vars[*]}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    else
        echo "   ❌ .env file not found"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    echo ""
}

# Function to test resource limits
test_resource_limits() {
    local compose_file=$1
    local test_name="Resource limits"
    
    echo "💾 Testing $test_name..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Start services
    docker-compose -f $compose_file up -d > /dev/null 2>&1
    
    # Wait for services to be ready
    sleep 10
    
    # Check resource usage
    local resource_ok=true
    
    # Check memory usage
    local memory_usage=$(docker stats --no-stream --format "table {{.MemUsage}}" | tail -n +2 | head -1)
    echo "   📊 Memory usage: $memory_usage"
    
    # Check CPU usage
    local cpu_usage=$(docker stats --no-stream --format "table {{.CPUPerc}}" | tail -n +2 | head -1)
    echo "   📊 CPU usage: $cpu_usage"
    
    # Stop services
    docker-compose -f $compose_file down > /dev/null 2>&1 || true
    
    echo "   ✅ Resource limits test completed"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo ""
}

# Main test execution
echo "🚀 Starting Docker Compose tests..."

# Test environment variables
echo "🔧 ENVIRONMENT TESTS"
echo "==================="
test_environment_variables "docker-compose.dev.yml"

# Test service startup
echo "🚀 SERVICE STARTUP TESTS"
echo "======================="
test_service_startup "docker-compose.dev.yml" "redis"
test_service_startup "docker-compose.dev.yml" "elasticsearch"
test_service_startup "docker-compose.dev.yml" "admin-backend"
test_service_startup "docker-compose.dev.yml" "admin-ui"
test_service_startup "docker-compose.dev.yml" "web"

# Test health checks
echo "🏥 HEALTH CHECK TESTS"
echo "===================="
test_health_checks "docker-compose.dev.yml" "admin-backend" "http://localhost:3002/health"
test_health_checks "docker-compose.dev.yml" "admin-ui" "http://localhost:3003/health"
test_health_checks "docker-compose.dev.yml" "web" "http://localhost:5173/health"

# Test service communication
echo "🌐 COMMUNICATION TESTS"
echo "====================="
test_service_communication "docker-compose.dev.yml"

# Test resource limits
echo "💾 RESOURCE TESTS"
echo "================"
test_resource_limits "docker-compose.dev.yml"

# Print test results
echo "📊 TEST RESULTS"
echo "==============="
echo "Total tests: $TOTAL_TESTS"
echo "Passed: $TESTS_PASSED"
echo "Failed: $TESTS_FAILED"
echo "Success rate: $(( (TESTS_PASSED * 100) / TOTAL_TESTS ))%"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo "🎉 All Docker Compose tests passed!"
    exit 0
else
    echo ""
    echo "⚠️  Some tests failed. Please check the Docker Compose configuration."
    exit 1
fi 