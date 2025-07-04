#!/bin/bash

echo "🚀 Setting up Production Database on Vercel..."

# Step 1: Pull production environment variables
echo "📥 Pulling production environment variables..."
vercel env pull .env.production

# Step 2: Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully!"
    
    # Step 3: Run database seeding
    echo "🌱 Running database seeding..."
    npx prisma db seed
    
    if [ $? -eq 0 ]; then
        echo "✅ Database seeding completed successfully!"
        echo ""
        echo "🎉 Production database is ready!"
        echo "📱 Your app should now work at: https://linktree-phi-six.vercel.app"
    else
        echo "❌ Database seeding failed!"
        echo "💡 You can try running: npx prisma db seed manually"
    fi
else
    echo "❌ Database migrations failed!"
    echo "💡 Check your DATABASE_URL and try again"
fi

# Cleanup
rm -f .env.production

echo ""
echo "🔗 Next steps:"
echo "1. Test your app at: https://linktree-phi-six.vercel.app"
echo "2. Try logging in/registering"
echo "3. Check if admin features work"
