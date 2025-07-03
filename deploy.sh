#!/bin/bash

echo "🚀 Starting deployment process..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Step 3: Build the project
echo "🏗️ Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Step 4: Deploy to Vercel
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deployment successful!"
        echo "🔗 Check your deployment at: https://vercel.com/dashboard"
    else
        echo "❌ Deployment failed!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi
