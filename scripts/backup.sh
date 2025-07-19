#!/bin/bash

# 🗄️ Benalsam Admin Panel Backup Script
# Bu script PostgreSQL, Elasticsearch ve konfigürasyon dosyalarını yedekler

set -e

# Konfigürasyon
BACKUP_DIR="/opt/benalsam-backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Create backup directory
mkdir -p "$BACKUP_DIR"

log "🚀 Starting backup process..."

# 1. PostgreSQL Backup
log "📊 Creating PostgreSQL backup..."
if docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres benalsam > "$BACKUP_DIR/postgres_$DATE.sql"; then
    log "✅ PostgreSQL backup created: postgres_$DATE.sql"
else
    error "❌ PostgreSQL backup failed"
    exit 1
fi

# 2. Elasticsearch Backup
log "🔍 Creating Elasticsearch backup..."
if docker-compose -f docker-compose.prod.yml exec -T elasticsearch curl -X PUT "localhost:9200/_snapshot/backup_repo/snapshot_$DATE?wait_for_completion=true" -H 'Content-Type: application/json' -d '{"indices": "*"}' > "$BACKUP_DIR/elasticsearch_$DATE.json" 2>&1; then
    log "✅ Elasticsearch backup created: elasticsearch_$DATE.json"
else
    warning "⚠️ Elasticsearch backup failed (might not be critical)"
fi

# 3. Configuration Files Backup
log "⚙️ Creating configuration backup..."
CONFIG_BACKUP="$BACKUP_DIR/config_$DATE.tar.gz"
tar -czf "$CONFIG_BACKUP" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='dist' \
    --exclude='build' \
    /opt/benalsam-admin

if [ $? -eq 0 ]; then
    log "✅ Configuration backup created: config_$DATE.tar.gz"
else
    error "❌ Configuration backup failed"
    exit 1
fi

# 4. Environment Variables Backup
log "🔐 Creating environment backup..."
if [ -f "/opt/benalsam-admin/.env" ]; then
    cp "/opt/benalsam-admin/.env" "$BACKUP_DIR/env_$DATE.env"
    log "✅ Environment backup created: env_$DATE.env"
else
    warning "⚠️ .env file not found"
fi

# 5. Nginx Configuration Backup
log "🌐 Creating Nginx configuration backup..."
if [ -f "/etc/nginx/sites-available/benalsam-admin" ]; then
    cp "/etc/nginx/sites-available/benalsam-admin" "$BACKUP_DIR/nginx_$DATE.conf"
    log "✅ Nginx configuration backup created: nginx_$DATE.conf"
else
    warning "⚠️ Nginx configuration not found"
fi

# 6. SSL Certificates Backup
log "🔒 Creating SSL certificates backup..."
if [ -d "/etc/letsencrypt/live/admin.benalsam.com" ]; then
    tar -czf "$BACKUP_DIR/ssl_$DATE.tar.gz" -C /etc/letsencrypt live/admin.benalsam.com
    log "✅ SSL certificates backup created: ssl_$DATE.tar.gz"
else
    warning "⚠️ SSL certificates not found"
fi

# 7. Create backup manifest
log "📋 Creating backup manifest..."
cat > "$BACKUP_DIR/manifest_$DATE.json" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "backup_id": "$DATE",
  "files": [
    "postgres_$DATE.sql",
    "elasticsearch_$DATE.json",
    "config_$DATE.tar.gz",
    "env_$DATE.env",
    "nginx_$DATE.conf",
    "ssl_$DATE.tar.gz"
  ],
  "system_info": {
    "hostname": "$(hostname)",
    "disk_usage": "$(df -h /opt | tail -1 | awk '{print $5}')",
    "backup_size": "$(du -sh $BACKUP_DIR | awk '{print $1}')"
  }
}
EOF

# 8. Cleanup old backups
log "🧹 Cleaning up old backups..."
find "$BACKUP_DIR" -name "*.sql" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.json" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.env" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.conf" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "manifest_*.json" -mtime +$RETENTION_DAYS -delete

log "✅ Cleanup completed"

# 9. Verify backup integrity
log "🔍 Verifying backup integrity..."
if [ -f "$BACKUP_DIR/postgres_$DATE.sql" ] && [ -s "$BACKUP_DIR/postgres_$DATE.sql" ]; then
    log "✅ PostgreSQL backup verification passed"
else
    error "❌ PostgreSQL backup verification failed"
    exit 1
fi

if [ -f "$BACKUP_DIR/config_$DATE.tar.gz" ] && [ -s "$BACKUP_DIR/config_$DATE.tar.gz" ]; then
    log "✅ Configuration backup verification passed"
else
    error "❌ Configuration backup verification failed"
    exit 1
fi

# 10. Create backup summary
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | awk '{print $1}')
log "📊 Backup completed successfully!"
log "📁 Backup location: $BACKUP_DIR"
log "📏 Total size: $BACKUP_SIZE"
log "🗓️ Backup ID: $DATE"

# 11. Optional: Upload to remote storage (if configured)
if [ -n "$REMOTE_BACKUP_URL" ]; then
    log "☁️ Uploading backup to remote storage..."
    # Add your remote upload logic here
    # Example: rsync, scp, or cloud storage CLI
fi

log "🎉 Backup process completed successfully!" 