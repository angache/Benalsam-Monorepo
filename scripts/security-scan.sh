#!/bin/bash

# Security Scanning Script for Benalsam Monorepo
# Bu script tüm Docker image'larını security açısından tarar

set -e

echo "🔒 Starting Security Scan for Benalsam Monorepo..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Trivy is available
if ! command -v trivy &> /dev/null; then
    echo "⚠️  Trivy not found. Installing Trivy..."
    # Install Trivy (macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install trivy
    else
        echo "❌ Please install Trivy manually: https://aquasecurity.github.io/trivy/latest/getting-started/installation/"
        exit 1
    fi
fi

# Function to scan Docker image
scan_image() {
    local image_name=$1
    local dockerfile_path=$2
    
    echo "🔍 Scanning $image_name..."
    
    # Build image for scanning
    docker build -f $dockerfile_path --target production -t benalsam-$image_name:scan .
    
    # Scan with Trivy
    echo "📊 Security scan results for $image_name:"
    trivy image benalsam-$image_name:scan --severity HIGH,CRITICAL --format table
    
    # Clean up
    docker rmi benalsam-$image_name:scan > /dev/null 2>&1 || true
    
    echo "✅ $image_name scan completed"
    echo ""
}

# Function to scan filesystem
scan_filesystem() {
    local path=$1
    local name=$2
    
    echo "🔍 Scanning filesystem: $name"
    trivy filesystem $path --severity HIGH,CRITICAL --format table
    echo "✅ $name filesystem scan completed"
    echo ""
}

# Scan all Docker images
echo "🐳 Scanning Docker images..."
scan_image "admin-backend" "packages/admin-backend/Dockerfile"
scan_image "admin-ui" "packages/admin-ui/Dockerfile"
scan_image "web" "packages/web/Dockerfile"

# Scan filesystem for vulnerabilities
echo "📁 Scanning filesystem for vulnerabilities..."
scan_filesystem "packages/admin-backend/src" "Admin Backend Source"
scan_filesystem "packages/admin-ui/src" "Admin UI Source"
scan_filesystem "packages/web/src" "Web App Source"

# Scan dependencies
echo "📦 Scanning dependencies..."
echo "🔍 Scanning package.json files for known vulnerabilities..."

# Check for npm audit issues
echo "📊 NPM Audit Results:"
cd packages/admin-backend && npm audit --audit-level=high || true
cd ../admin-ui && npm audit --audit-level=high || true
cd ../web && npm audit --audit-level=high || true
cd ../..

# Check for pnpm audit issues
echo "📊 PNPM Audit Results:"
pnpm audit --audit-level=high || true

echo "✅ Security scan completed!"
echo ""
echo "📋 Summary:"
echo "   - Docker images scanned: 3"
echo "   - Filesystem scans: 3"
echo "   - Dependency audits: 4"
echo ""
echo "🔧 Recommendations:"
echo "   - Fix any HIGH/CRITICAL vulnerabilities found"
echo "   - Update dependencies regularly"
echo "   - Run this scan before each deployment" 