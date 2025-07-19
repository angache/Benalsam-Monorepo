#!/bin/bash

# ⏰ Benalsam Admin Panel Backup Cron Setup
# Bu script otomatik backup için cron job kurar

set -e

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

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    error "This script must be run as root"
    exit 1
fi

# Configuration
BACKUP_SCRIPT="/opt/benalsam-admin/scripts/backup.sh"
LOG_FILE="/var/log/benalsam-backup.log"
CRON_USER="root"

log "🔧 Setting up automated backup cron job..."

# 1. Create log file
log "📝 Creating log file..."
touch "$LOG_FILE"
chmod 644 "$LOG_FILE"

# 2. Create logrotate configuration
log "🔄 Setting up log rotation..."
cat > /etc/logrotate.d/benalsam-backup << EOF
$LOG_FILE {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        systemctl reload rsyslog > /dev/null 2>&1 || true
    endscript
}
EOF

# 3. Setup cron job
log "⏰ Setting up cron job..."

# Remove existing cron job if exists
crontab -u "$CRON_USER" -l 2>/dev/null | grep -v "benalsam-backup" | crontab -u "$CRON_USER" - || true

# Add new cron job (daily at 2 AM)
(crontab -u "$CRON_USER" -l 2>/dev/null; echo "0 2 * * * $BACKUP_SCRIPT >> $LOG_FILE 2>&1") | crontab -u "$CRON_USER" -

# 4. Create backup monitoring script
log "📊 Creating backup monitoring script..."
cat > /opt/benalsam-admin/scripts/check-backup.sh << 'EOF'
#!/bin/bash

# Check if backup was successful in the last 24 hours
BACKUP_DIR="/opt/benalsam-backups"
LOG_FILE="/var/log/benalsam-backup.log"

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Backup directory not found"
    exit 1
fi

# Check for recent backup files (last 24 hours)
RECENT_BACKUP=$(find "$BACKUP_DIR" -name "manifest_*.json" -mtime -1 | head -1)

if [ -z "$RECENT_BACKUP" ]; then
    echo "❌ No recent backup found in the last 24 hours"
    exit 1
fi

# Check backup size
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | awk '{print $1}')
echo "✅ Recent backup found: $(basename "$RECENT_BACKUP")"
echo "📏 Backup size: $BACKUP_SIZE"

# Check log for errors
if grep -i "error\|failed" "$LOG_FILE" | tail -10; then
    echo "⚠️ Errors found in backup log"
    exit 1
fi

echo "✅ Backup check completed successfully"
EOF

chmod +x /opt/benalsam-admin/scripts/check-backup.sh

# 5. Setup backup monitoring cron (every 6 hours)
log "🔍 Setting up backup monitoring..."
(crontab -u "$CRON_USER" -l 2>/dev/null; echo "0 */6 * * * /opt/benalsam-admin/scripts/check-backup.sh >> /var/log/benalsam-backup-check.log 2>&1") | crontab -u "$CRON_USER" -

# 6. Create backup cleanup script
log "🧹 Creating backup cleanup script..."
cat > /opt/benalsam-admin/scripts/cleanup-backups.sh << 'EOF'
#!/bin/bash

# Cleanup old backups (keep last 7 days)
BACKUP_DIR="/opt/benalsam-backups"
RETENTION_DAYS=7

echo "🧹 Cleaning up backups older than $RETENTION_DAYS days..."

# Remove old backup files
find "$BACKUP_DIR" -name "*.sql" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.json" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.env" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.conf" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "manifest_*.json" -mtime +$RETENTION_DAYS -delete

echo "✅ Cleanup completed"
EOF

chmod +x /opt/benalsam-admin/scripts/cleanup-backups.sh

# 7. Setup cleanup cron (weekly on Sunday at 3 AM)
log "🗑️ Setting up cleanup cron job..."
(crontab -u "$CRON_USER" -l 2>/dev/null; echo "0 3 * * 0 /opt/benalsam-admin/scripts/cleanup-backups.sh >> /var/log/benalsam-backup-cleanup.log 2>&1") | crontab -u "$CRON_USER" -

# 8. Create backup status script
log "📊 Creating backup status script..."
cat > /opt/benalsam-admin/scripts/backup-status.sh << 'EOF'
#!/bin/bash

# Show backup status and statistics
BACKUP_DIR="/opt/benalsam-backups"
LOG_FILE="/var/log/benalsam-backup.log"

echo "📊 Benalsam Admin Panel Backup Status"
echo "====================================="
echo ""

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Backup directory not found: $BACKUP_DIR"
    exit 1
fi

# Show recent backups
echo "📋 Recent Backups:"
echo "------------------"
for manifest in "$BACKUP_DIR"/manifest_*.json; do
    if [ -f "$manifest" ]; then
        backup_id=$(basename "$manifest" .json | sed 's/manifest_//')
        timestamp=$(jq -r '.timestamp' "$manifest" 2>/dev/null || echo "Unknown")
        size=$(jq -r '.system_info.backup_size' "$manifest" 2>/dev/null || echo "Unknown")
        
        echo "  ID: $backup_id"
        echo "  Date: $timestamp"
        echo "  Size: $size"
        echo ""
    fi
done

# Show backup statistics
echo "📈 Backup Statistics:"
echo "-------------------"
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "manifest_*.json" | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | awk '{print $1}')
OLDEST_BACKUP=$(find "$BACKUP_DIR" -name "manifest_*.json" -printf '%T+ %p\n' | sort | head -1 | awk '{print $1}')
NEWEST_BACKUP=$(find "$BACKUP_DIR" -name "manifest_*.json" -printf '%T+ %p\n' | sort | tail -1 | awk '{print $1}')

echo "  Total backups: $TOTAL_BACKUPS"
echo "  Total size: $TOTAL_SIZE"
echo "  Oldest backup: $OLDEST_BACKUP"
echo "  Newest backup: $NEWEST_BACKUP"
echo ""

# Show cron jobs
echo "⏰ Scheduled Jobs:"
echo "----------------"
crontab -l 2>/dev/null | grep -E "(benalsam-backup|check-backup|cleanup-backups)" || echo "  No backup cron jobs found"
echo ""

# Show recent log entries
echo "📝 Recent Log Entries:"
echo "---------------------"
if [ -f "$LOG_FILE" ]; then
    tail -10 "$LOG_FILE"
else
    echo "  No log file found"
fi
EOF

chmod +x /opt/benalsam-admin/scripts/backup-status.sh

# 9. Test backup script
log "🧪 Testing backup script..."
if [ -f "$BACKUP_SCRIPT" ]; then
    log "✅ Backup script found: $BACKUP_SCRIPT"
else
    error "❌ Backup script not found: $BACKUP_SCRIPT"
    exit 1
fi

# 10. Show current cron jobs
log "📋 Current cron jobs:"
crontab -u "$CRON_USER" -l | grep -E "(benalsam-backup|check-backup|cleanup-backups)" || echo "  No backup cron jobs found"

# 11. Create usage instructions
log "📖 Creating usage instructions..."
cat > /opt/benalsam-admin/scripts/BACKUP_README.md << 'EOF'
# 🗄️ Benalsam Admin Panel Backup System

## 📋 Overview
Automated backup system for Benalsam Admin Panel including PostgreSQL, Elasticsearch, configuration files, and SSL certificates.

## 🚀 Setup
The backup system is automatically configured with the following components:

### Cron Jobs
- **Daily Backup**: 2:00 AM daily
- **Backup Monitoring**: Every 6 hours
- **Cleanup**: Weekly on Sunday at 3:00 AM

### Log Files
- Backup logs: `/var/log/benalsam-backup.log`
- Monitoring logs: `/var/log/benalsam-backup-check.log`
- Cleanup logs: `/var/log/benalsam-backup-cleanup.log`

## 📊 Usage

### Check Backup Status
```bash
/opt/benalsam-admin/scripts/backup-status.sh
```

### Manual Backup
```bash
/opt/benalsam-admin/scripts/backup.sh
```

### List Available Backups
```bash
/opt/benalsam-admin/scripts/restore.sh list
```

### Restore from Backup
```bash
/opt/benalsam-admin/scripts/restore.sh restore <backup_id>
```

### Validate Backup
```bash
/opt/benalsam-admin/scripts/restore.sh validate <backup_id>
```

## 🔧 Configuration

### Backup Retention
- Default retention: 7 days
- Configurable in backup script

### Backup Location
- Default location: `/opt/benalsam-backups`
- Contains: PostgreSQL dumps, Elasticsearch snapshots, configuration files, SSL certificates

## 📈 Monitoring

### Health Checks
- Automated backup verification
- Log file monitoring
- Error alerting

### Manual Verification
```bash
# Check recent backups
find /opt/benalsam-backups -name "manifest_*.json" -mtime -1

# Check backup logs
tail -f /var/log/benalsam-backup.log

# Verify backup integrity
/opt/benalsam-admin/scripts/check-backup.sh
```

## 🚨 Troubleshooting

### Common Issues
1. **Backup fails**: Check disk space and permissions
2. **Restore fails**: Verify backup integrity
3. **Cron not running**: Check cron service status

### Log Locations
- Backup logs: `/var/log/benalsam-backup.log`
- System logs: `journalctl -u cron`

### Emergency Recovery
```bash
# Stop automated backups
crontab -e  # Comment out backup lines

# Manual restore
/opt/benalsam-admin/scripts/restore.sh restore <backup_id>

# Restart automated backups
crontab -e  # Uncomment backup lines
```
EOF

log "✅ Backup cron setup completed successfully!"
log ""
log "📋 Summary:"
log "  - Daily backup at 2:00 AM"
log "  - Backup monitoring every 6 hours"
log "  - Weekly cleanup on Sunday at 3:00 AM"
log "  - Log rotation configured"
log "  - Backup retention: 7 days"
log ""
log "📖 Usage:"
log "  - Check status: /opt/benalsam-admin/scripts/backup-status.sh"
log "  - Manual backup: /opt/benalsam-admin/scripts/backup.sh"
log "  - Restore: /opt/benalsam-admin/scripts/restore.sh"
log ""
log "📁 Backup location: /opt/benalsam-backups"
log "📝 Log file: /var/log/benalsam-backup.log" 