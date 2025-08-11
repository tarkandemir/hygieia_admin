#!/bin/bash

# Hygieia v4 Deployment Script
echo "🚀 Starting Hygieia v4 deployment..."

# Check if environment variables are set
if [ -z "$MONGODB_URI" ]; then
    echo "❌ Error: MONGODB_URI environment variable is not set"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ Error: JWT_SECRET environment variable is not set"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build the application
echo "🏗️ Building application..."
npm run build

# Start with PM2
echo "🔄 Starting application with PM2..."
pm2 stop hygieia-v4 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo "✅ Deployment completed!"
echo "🌐 Application is running on port 3000"
echo "📊 Check status: pm2 status"
echo "📝 Check logs: pm2 logs hygieia-v4" 