#!/bin/bash

echo "🚀 Starting Benalsam Monorepo (VM Environment)"

# Stop existing processes
echo "🛑 Stopping existing PM2 processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Start with VM config
echo "✅ Starting services with VM configuration..."
pm2 start ecosystem.vm.js

# Show status
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🌐 Services:"
echo "  - Admin Backend: http://192.168.30.129:3002"
echo "  - Admin UI: http://192.168.30.129:3003/admin/"
echo "  - Web: http://192.168.30.129:5173"
echo ""
echo "📝 Commands:"
echo "  - View logs: pm2 logs"
echo "  - Stop all: pm2 stop all"
echo "  - Restart all: pm2 restart all"
echo "  - Monitor: pm2 monit" 