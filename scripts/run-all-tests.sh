#!/bin/bash

# Master Test Script for Benalsam Monorepo
# Bu script tüm testleri sırayla çalıştırır

set -e

echo "🧪 Starting All Tests for Benalsam Monorepo..."
echo "=============================================="

# Test results tracking
TOTAL_TESTS_PASSED=0
TOTAL_TESTS_FAILED=0
TOTAL_TEST_SUITES=0

# Function to run test suite
run_test_suite() {
    local test_script=$1
    local test_name=$2
    
    echo ""
    echo "🚀 Running $test_name..."
    echo "========================="
    
    TOTAL_TEST_SUITES=$((TOTAL_TEST_SUITES + 1))
    
    if ./scripts/$test_script; then
        echo "✅ $test_name completed successfully"
        TOTAL_TESTS_PASSED=$((TOTAL_TESTS_PASSED + 1))
    else
        echo "❌ $test_name failed"
        TOTAL_TESTS_FAILED=$((TOTAL_TESTS_FAILED + 1))
    fi
    
    echo ""
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if required tools are available
echo "🔧 Checking required tools..."

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose."
    exit 1
fi

# Check curl
if ! command -v curl &> /dev/null; then
    echo "❌ curl not found. Please install curl."
    exit 1
fi

# Check bc
if ! command -v bc &> /dev/null; then
    echo "❌ bc not found. Please install bc."
    exit 1
fi

echo "✅ All required tools are available"
echo ""

# Run all test suites
echo "🧪 EXECUTING ALL TEST SUITES"
echo "============================"

# 1. Docker Build Tests
run_test_suite "docker-build-test.sh" "Docker Build Tests"

# 2. Docker Compose Tests
run_test_suite "docker-compose-test.sh" "Docker Compose Tests"

# 3. Security Scanning Tests
run_test_suite "security-scan.sh" "Security Scanning Tests"

# 4. Cache Performance Tests
run_test_suite "cache-performance.sh" "Cache Performance Tests"

# 5. Integration Tests
run_test_suite "integration-test.sh" "Integration Tests"

# Print final results
echo "📊 FINAL TEST RESULTS"
echo "===================="
echo "Total test suites: $TOTAL_TEST_SUITES"
echo "Passed: $TOTAL_TESTS_PASSED"
echo "Failed: $TOTAL_TESTS_FAILED"
echo "Success rate: $(( (TOTAL_TESTS_PASSED * 100) / TOTAL_TEST_SUITES ))%"

if [ $TOTAL_TESTS_FAILED -eq 0 ]; then
    echo ""
    echo "🎉 All test suites passed!"
    echo "✅ Benalsam Monorepo is ready for production!"
    exit 0
else
    echo ""
    echo "⚠️  Some test suites failed. Please review the results above."
    echo "🔧 Recommended actions:"
    echo "   - Check Docker configuration"
    echo "   - Verify environment variables"
    echo "   - Review security scan results"
    echo "   - Optimize build performance"
    echo "   - Fix integration issues"
    exit 1
fi 