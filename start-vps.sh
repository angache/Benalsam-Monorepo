#!/bin/bash

echo "🚀 Starting Benalsam Monorepo (VPS Production)"

# Stop existing processes
echo "🛑 Stopping existing PM2 processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Start with VPS config
echo "✅ Starting services with VPS configuration..."
pm2 start ecosystem.vps.js

# Show status
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🌐 Services:"
echo "  - Admin Backend: http://209.227.228.96:3002"
echo "  - Admin UI: http://209.227.228.96:3003/admin/"
echo "  - Web: http://209.227.228.96:5173"
echo ""
echo "📝 Commands:"
echo "  - View logs: pm2 logs"
echo "  - Stop all: pm2 stop all"
echo "  - Restart all: pm2 restart all" 