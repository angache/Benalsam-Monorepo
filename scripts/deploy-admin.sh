#!/bin/bash

# Benalsam Admin Production Deployment Script
# Bu script production environment'ı deploy eder

set -e

echo "🚀 Benalsam Admin Production Deployment"
echo "======================================"

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

# Configuration
PROJECT_DIR="/opt/benalsam-admin"
BACKUP_DIR="/opt/benalsam-admin/backups"
LOG_FILE="/var/log/benalsam-admin/deploy.log"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    sudo mkdir -p $PROJECT_DIR
    sudo mkdir -p $BACKUP_DIR
    sudo mkdir -p /var/log/benalsam-admin
    sudo mkdir -p /etc/nginx/ssl
    print_success "Directories created"
}

# Backup current deployment
backup_current() {
    if [ -d "$PROJECT_DIR/current" ]; then
        print_status "Creating backup of current deployment..."
        sudo cp -r $PROJECT_DIR/current $BACKUP_DIR/backup_$TIMESTAMP
        print_success "Backup created: backup_$TIMESTAMP"
    fi
}

# Pull latest code
pull_latest_code() {
    print_status "Pulling latest code from Git..."
    cd $PROJECT_DIR
    
    if [ ! -d "benalsam-monorepo" ]; then
        sudo git clone https://github.com/angache/Benalsam-Monorepo.git benalsam-monorepo
    else
        cd benalsam-monorepo
        sudo git fetch origin
        sudo git reset --hard origin/main
    fi
    
    print_success "Latest code pulled"
}

# Build and deploy
build_and_deploy() {
    print_status "Building and deploying services..."
    cd $PROJECT_DIR/benalsam-monorepo
    
    # Stop current services
    print_status "Stopping current services..."
    sudo docker-compose -f docker-compose.prod.yml down || true
    
    # Build new images
    print_status "Building Docker images..."
    sudo docker-compose -f docker-compose.prod.yml build --no-cache
    
    # Start services
    print_status "Starting services..."
    sudo docker-compose -f docker-compose.prod.yml up -d
    
    print_success "Services deployed"
}

# Health checks
health_checks() {
    print_status "Running health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check admin-backend
    if curl -f http://localhost:3002/health > /dev/null 2>&1; then
        print_success "Admin Backend is healthy"
    else
        print_error "Admin Backend health check failed"
        return 1
    fi
    
    # Check admin-ui
    if curl -f http://localhost:3003/health > /dev/null 2>&1; then
        print_success "Admin UI is healthy"
    else
        print_error "Admin UI health check failed"
        return 1
    fi
    
    # Check nginx
    if curl -f http://localhost/health > /dev/null 2>&1; then
        print_success "Nginx is healthy"
    else
        print_error "Nginx health check failed"
        return 1
    fi
    
    print_success "All health checks passed"
}

# Rollback function
rollback() {
    print_warning "Rolling back to previous deployment..."
    
    # Stop current services
    sudo docker-compose -f docker-compose.prod.yml down
    
    # Restore from backup
    if [ -d "$BACKUP_DIR/backup_$TIMESTAMP" ]; then
        sudo rm -rf $PROJECT_DIR/current
        sudo cp -r $BACKUP_DIR/backup_$TIMESTAMP $PROJECT_DIR/current
        cd $PROJECT_DIR/current
        sudo docker-compose -f docker-compose.prod.yml up -d
        print_success "Rollback completed"
    else
        print_error "No backup found for rollback"
        return 1
    fi
}

# Setup SSL certificates (Let's Encrypt)
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        print_status "Installing certbot..."
        sudo apt update
        sudo apt install -y certbot python3-certbot-nginx
    fi
    
    # Generate SSL certificate
    if [ ! -f "/etc/nginx/ssl/cert.pem" ]; then
        print_status "Generating SSL certificate..."
        sudo certbot certonly --standalone -d admin.benalsam.com --non-interactive --agree-tos --email admin@benalsam.com
        sudo cp /etc/letsencrypt/live/admin.benalsam.com/fullchain.pem /etc/nginx/ssl/cert.pem
        sudo cp /etc/letsencrypt/live/admin.benalsam.com/privkey.pem /etc/nginx/ssl/key.pem
        print_success "SSL certificate generated"
    else
        print_status "SSL certificate already exists"
    fi
}

# Setup firewall
setup_firewall() {
    print_status "Setting up firewall rules..."
    
    # Allow SSH
    sudo ufw allow ssh
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80
    sudo ufw allow 443
    
    # Allow admin ports
    sudo ufw allow 3002
    sudo ufw allow 3003
    
    # Enable firewall
    sudo ufw --force enable
    
    print_success "Firewall configured"
}

# Main deployment function
main() {
    print_status "Starting deployment process..."
    
    # Create directories
    create_directories
    
    # Backup current deployment
    backup_current
    
    # Pull latest code
    pull_latest_code
    
    # Setup SSL certificates
    setup_ssl
    
    # Setup firewall
    setup_firewall
    
    # Build and deploy
    build_and_deploy
    
    # Health checks
    if health_checks; then
        print_success "🎉 Deployment completed successfully!"
        echo ""
        echo "📊 Services Status:"
        echo "  • Admin Backend: https://admin.benalsam.com/api/v1"
        echo "  • Admin UI: https://admin.benalsam.com"
        echo "  • Health Check: https://admin.benalsam.com/health"
        echo ""
        echo "📝 Logs:"
        echo "  • Application logs: docker-compose -f docker-compose.prod.yml logs"
        echo "  • Nginx logs: sudo tail -f /var/log/nginx/access.log"
        echo ""
    else
        print_error "❌ Deployment failed! Rolling back..."
        rollback
        exit 1
    fi
}

# Error handling
trap 'print_error "Deployment failed with error code $?"; rollback; exit 1' ERR

# Run main function
main "$@" 