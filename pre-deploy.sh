#!/bin/bash

echo "🔧 Pre-deployment checklist..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "Please create .env.local with your environment variables"
    echo "Use .env.example as a template"
    exit 1
fi

echo "✅ Environment file found"

# Check if database connection works
echo "🔍 Checking database connection..."
npm run db:generate > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Database connection failed!"
    echo "Please check your DATABASE_URL in .env.local"
    exit 1
fi

echo "✅ Database connection works"

# Run build
echo "🏗️ Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo "🚀 Ready for deployment!"

echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your repository to Vercel"
echo "3. Set up environment variables in Vercel"
echo "4. Deploy!"
echo ""
echo "Or run: vercel --prod (if you have Vercel CLI installed)"
