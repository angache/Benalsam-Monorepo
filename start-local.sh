#!/bin/bash

echo "🚀 Starting Benalsam Monorepo (Local Development)"

# Stop existing processes
echo "🛑 Stopping existing PM2 processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Start with local config
echo "✅ Starting services with local configuration..."
pm2 start ecosystem.local.js

# Show status
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🌐 Services:"
echo "  - Admin Backend: http://localhost:3002"
echo "  - Admin UI: http://localhost:3003/admin/"
echo "  - Web: http://localhost:5173"
echo "  - Mobile Dev Server: http://localhost:8081"
echo ""
echo "📝 Commands:"
echo "  - View logs: pm2 logs"
echo "  - Stop all: pm2 stop all"
echo "  - Restart all: pm2 restart all" 