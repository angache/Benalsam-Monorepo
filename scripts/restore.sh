#!/bin/bash

# 🔄 Benalsam Admin Panel Restore Script
# Bu script yedeklerden sistemi geri yükler

set -e

# Konfigürasyon
BACKUP_DIR="/opt/benalsam-backups"
ADMIN_DIR="/opt/benalsam-admin"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Function to show available backups
show_backups() {
    log "📋 Available backups:"
    echo ""
    
    for manifest in "$BACKUP_DIR"/manifest_*.json; do
        if [ -f "$manifest" ]; then
            backup_id=$(basename "$manifest" .json | sed 's/manifest_//')
            timestamp=$(jq -r '.timestamp' "$manifest" 2>/dev/null || echo "Unknown")
            size=$(jq -r '.system_info.backup_size' "$manifest" 2>/dev/null || echo "Unknown")
            
            echo -e "  ${BLUE}ID:${NC} $backup_id"
            echo -e "  ${BLUE}Date:${NC} $timestamp"
            echo -e "  ${BLUE}Size:${NC} $size"
            echo ""
        fi
    done
}

# Function to validate backup
validate_backup() {
    local backup_id=$1
    local manifest="$BACKUP_DIR/manifest_$backup_id.json"
    
    if [ ! -f "$manifest" ]; then
        error "Backup manifest not found: $manifest"
        return 1
    fi
    
    log "🔍 Validating backup $backup_id..."
    
    # Check if all files exist
    while IFS= read -r file; do
        if [ ! -f "$BACKUP_DIR/$file" ]; then
            error "Backup file missing: $file"
            return 1
        fi
    done < <(jq -r '.files[]' "$manifest")
    
    log "✅ Backup validation passed"
    return 0
}

# Function to restore PostgreSQL
restore_postgres() {
    local backup_id=$1
    local sql_file="$BACKUP_DIR/postgres_$backup_id.sql"
    
    log "📊 Restoring PostgreSQL database..."
    
    # Stop the application
    cd "$ADMIN_DIR"
    docker-compose -f docker-compose.prod.yml stop admin-backend admin-ui
    
    # Restore database
    if docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d benalsam < "$sql_file"; then
        log "✅ PostgreSQL restore completed"
    else
        error "❌ PostgreSQL restore failed"
        return 1
    fi
}

# Function to restore Elasticsearch
restore_elasticsearch() {
    local backup_id=$1
    local snapshot_name="snapshot_$backup_id"
    
    log "🔍 Restoring Elasticsearch indices..."
    
    # Restore snapshot
    if docker-compose -f docker-compose.prod.yml exec -T elasticsearch curl -X POST "localhost:9200/_snapshot/backup_repo/$snapshot_name/_restore?wait_for_completion=true" -H 'Content-Type: application/json' -d '{"indices": "*"}' > /dev/null 2>&1; then
        log "✅ Elasticsearch restore completed"
    else
        warning "⚠️ Elasticsearch restore failed (might not be critical)"
    fi
}

# Function to restore configuration
restore_config() {
    local backup_id=$1
    local config_file="$BACKUP_DIR/config_$backup_id.tar.gz"
    
    log "⚙️ Restoring configuration files..."
    
    # Create temporary directory
    local temp_dir=$(mktemp -d)
    
    # Extract configuration
    tar -xzf "$config_file" -C "$temp_dir"
    
    # Restore files (excluding sensitive data)
    rsync -av --exclude='.env' --exclude='node_modules' --exclude='dist' --exclude='build' "$temp_dir/opt/benalsam-admin/" "$ADMIN_DIR/"
    
    # Cleanup
    rm -rf "$temp_dir"
    
    log "✅ Configuration restore completed"
}

# Function to restore environment
restore_env() {
    local backup_id=$1
    local env_file="$BACKUP_DIR/env_$backup_id.env"
    
    if [ -f "$env_file" ]; then
        log "🔐 Restoring environment variables..."
        cp "$env_file" "$ADMIN_DIR/.env"
        log "✅ Environment restore completed"
    else
        warning "⚠️ Environment file not found"
    fi
}

# Function to restore Nginx configuration
restore_nginx() {
    local backup_id=$1
    local nginx_file="$BACKUP_DIR/nginx_$backup_id.conf"
    
    if [ -f "$nginx_file" ]; then
        log "🌐 Restoring Nginx configuration..."
        cp "$nginx_file" "/etc/nginx/sites-available/benalsam-admin"
        nginx -t && systemctl reload nginx
        log "✅ Nginx configuration restore completed"
    else
        warning "⚠️ Nginx configuration file not found"
    fi
}

# Function to restore SSL certificates
restore_ssl() {
    local backup_id=$1
    local ssl_file="$BACKUP_DIR/ssl_$backup_id.tar.gz"
    
    if [ -f "$ssl_file" ]; then
        log "🔒 Restoring SSL certificates..."
        tar -xzf "$ssl_file" -C /etc/letsencrypt/
        systemctl reload nginx
        log "✅ SSL certificates restore completed"
    else
        warning "⚠️ SSL certificates file not found"
    fi
}

# Main restore function
restore_backup() {
    local backup_id=$1
    
    log "🔄 Starting restore process for backup: $backup_id"
    
    # Validate backup
    if ! validate_backup "$backup_id"; then
        error "Backup validation failed"
        exit 1
    fi
    
    # Confirm restore
    echo ""
    warning "⚠️ This will overwrite current data. Are you sure? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log "Restore cancelled"
        exit 0
    fi
    
    # Create restore point
    log "💾 Creating restore point..."
    if [ -d "$ADMIN_DIR" ]; then
        cp -r "$ADMIN_DIR" "$ADMIN_DIR.restore_point.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Perform restore
    restore_postgres "$backup_id"
    restore_elasticsearch "$backup_id"
    restore_config "$backup_id"
    restore_env "$backup_id"
    restore_nginx "$backup_id"
    restore_ssl "$backup_id"
    
    # Restart services
    log "🚀 Restarting services..."
    cd "$ADMIN_DIR"
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be healthy
    log "⏳ Waiting for services to be healthy..."
    sleep 30
    
    # Health check
    if curl -f http://localhost:3002/api/v1/health > /dev/null 2>&1; then
        log "✅ Restore completed successfully!"
        log "🌐 Admin panel should be available at: http://admin.benalsam.com"
    else
        error "❌ Health check failed after restore"
        error "You may need to manually restart services or check logs"
        exit 1
    fi
}

# Main script logic
main() {
    if [ ! -d "$BACKUP_DIR" ]; then
        error "Backup directory not found: $BACKUP_DIR"
        exit 1
    fi
    
    case "${1:-}" in
        "list"|"ls")
            show_backups
            ;;
        "validate"|"check")
            if [ -z "$2" ]; then
                error "Please provide backup ID"
                exit 1
            fi
            validate_backup "$2"
            ;;
        "restore")
            if [ -z "$2" ]; then
                error "Please provide backup ID"
                echo ""
                info "Usage: $0 restore <backup_id>"
                echo ""
                show_backups
                exit 1
            fi
            restore_backup "$2"
            ;;
        *)
            echo "🔄 Benalsam Admin Panel Restore Script"
            echo ""
            echo "Usage:"
            echo "  $0 list                    - Show available backups"
            echo "  $0 validate <backup_id>    - Validate backup integrity"
            echo "  $0 restore <backup_id>     - Restore from backup"
            echo ""
            echo "Examples:"
            echo "  $0 list"
            echo "  $0 validate 20250719_143000"
            echo "  $0 restore 20250719_143000"
            echo ""
            exit 1
            ;;
    esac
}

# Run main function
main "$@" 