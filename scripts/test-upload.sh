#!/bin/bash

# Test Upload System
echo "🧪 Testing Upload System..."
echo "================================"

# Check if required environment variables are set
echo "📋 Checking environment variables..."
if [ -z "$BLOB_READ_WRITE_TOKEN" ]; then
    echo "❌ BLOB_READ_WRITE_TOKEN not set"
    echo "💡 For production, set this in Vercel Dashboard"
    echo "💡 For development, add to .env.local"
else
    echo "✅ BLOB_READ_WRITE_TOKEN configured"
fi

# Check if upload directories exist (for development)
echo "📁 Checking upload directories..."
if [ ! -d "public/uploads/category-icons" ]; then
    echo "📁 Creating upload directories..."
    mkdir -p public/uploads/category-icons
    echo "✅ Upload directories created"
else
    echo "✅ Upload directories exist"
fi

# Check Node.js environment
echo "🔧 Environment: $NODE_ENV"
if [ "$NODE_ENV" = "production" ]; then
    echo "🚀 Production mode - Using Vercel Blob"
    if [ -z "$BLOB_READ_WRITE_TOKEN" ]; then
        echo "❌ BLOB_READ_WRITE_TOKEN required for production"
        exit 1
    fi
else
    echo "🛠️  Development mode - Using local storage"
fi

# Check required packages
echo "📦 Checking dependencies..."
if npm list @vercel/blob &>/dev/null; then
    echo "✅ @vercel/blob installed"
else
    echo "❌ @vercel/blob not installed"
    echo "💡 Run: npm install @vercel/blob"
fi

echo "================================"
echo "🎯 Upload System Status:"
echo "  - Environment: $NODE_ENV"
echo "  - Blob Token: $([ -n "$BLOB_READ_WRITE_TOKEN" ] && echo "✅ Set" || echo "❌ Not set")"
echo "  - Upload Dir: $([ -d "public/uploads/category-icons" ] && echo "✅ Exists" || echo "❌ Missing")"
echo "================================"

# Test upload endpoint (if server is running)
echo "🔍 Testing upload endpoint..."
if curl -s -f http://localhost:3000/api/upload/category-icon -o /dev/null; then
    echo "✅ Upload endpoint accessible"
else
    echo "ℹ️  Upload endpoint test skipped (server not running)"
fi

echo "✅ Upload system check complete!"
