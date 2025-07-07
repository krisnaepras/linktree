#!/bin/bash

echo "🔧 Setting up Vercel Environment Variables..."

# Check if user has database URL
echo "Please provide your database information:"
echo ""

read -p "DATABASE_URL (PostgreSQL connection string): " DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is required!"
    exit 1
fi

read -p "NEXTAUTH_SECRET (min 32 characters): " NEXTAUTH_SECRET
if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ NEXTAUTH_SECRET is required!"
    exit 1
fi

# Get the domain
echo "Getting your project domain..."
DOMAIN=$(vercel ls | grep linktree | head -1 | awk '{print $2}')
if [ -z "$DOMAIN" ]; then
    DOMAIN="linktree.vercel.app"
fi

NEXTAUTH_URL="https://$DOMAIN"

echo ""
echo "📝 Adding environment variables to Vercel..."

# Add environment variables
vercel env add DATABASE_URL production <<< "$DATABASE_URL"
vercel env add NEXTAUTH_URL production <<< "$NEXTAUTH_URL"
vercel env add NEXTAUTH_SECRET production <<< "$NEXTAUTH_SECRET"

echo ""
echo "✅ Environment variables added successfully!"
echo ""
echo "🚀 Now deploying to production..."
vercel --prod
