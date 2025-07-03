# 🚀 Deployment Guide ke Vercel

## 📋 Prerequisites

-   [x] ✅ Build berhasil (sudah dicek)
-   [ ] Akun Vercel (https://vercel.com)
-   [ ] Database PostgreSQL (pilih salah satu):
    -   Vercel Postgres (Recommended)
    -   Neon DB (Free tier bagus)
    -   Railway
    -   Supabase

## 🎯 Step-by-Step Deployment

### 1. Setup Database

#### Opsi A: Vercel Postgres (Recommended)

```bash
# Nanti setelah deploy, buka Vercel Dashboard
# Storage → Create Database → Postgres
# Copy connection string
```

#### Opsi B: Neon DB (Free & Mudah)

```bash
# 1. Buka https://neon.tech
# 2. Sign up dan create database
# 3. Copy connection string
```

### 2. Siapkan Environment Variables

```bash
# Copy dan edit .env.example
cp .env.example .env.local

# Edit file .env.local dengan data berikut:
DATABASE_URL="your-postgres-url"
DIRECT_URL="your-direct-postgres-url"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-secret-32-chars-min"
```

### 3. Test Build Lokal

```bash
# Jalankan pre-deployment check
./pre-deploy.sh

# Atau manual:
npm run build
npm run start
```

### 4. Deploy ke Vercel

#### Opsi A: Via GitHub (Recommended)

1. **Push ke GitHub**

    ```bash
    git add .
    git commit -m "Ready for deployment"
    git push origin main
    ```

2. **Connect ke Vercel**

    - Buka https://vercel.com/dashboard
    - Click "New Project"
    - Import dari GitHub repository
    - Pilih repository `linktree-kkn`

3. **Configure Environment Variables**

    - Pada saat import, akan ada section "Environment Variables"
    - Atau bisa diatur nanti di Project Settings → Environment Variables
    - Tambahkan:
        ```
        DATABASE_URL = your-postgres-url
        DIRECT_URL = your-direct-postgres-url
        NEXTAUTH_URL = https://your-domain.vercel.app
        NEXTAUTH_SECRET = your-secret-key
        ```

4. **Deploy**
    - Click "Deploy"
    - Tunggu proses selesai (~2-3 menit)

#### Opsi B: Via Vercel CLI

```bash
# Install CLI (jika belum)
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 5. Setup Database di Production

```bash
# Setelah deploy, jalankan migrations
# Buka Vercel Dashboard → Functions → View Function Logs
# Atau gunakan Vercel CLI:

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Seed data (optional)
npx prisma db seed
```

### 6. Verifikasi Deployment

-   [ ] Website bisa dibuka
-   [ ] Login/register bekerja
-   [ ] Dashboard bisa diakses
-   [ ] Database terhubung
-   [ ] Upload file bekerja

## 🛠️ Troubleshooting

### Build Error

```bash
# Cek error log
npm run build

# Common fixes:
# 1. Update next.config.ts (sudah done)
# 2. Fix TypeScript errors
# 3. Check dependencies
```

### Database Connection Error

```bash
# Test connection
npx prisma db push

# Check:
# 1. DATABASE_URL correct
# 2. Database accessible
# 3. Migrations applied
```

### Environment Variables Not Working

```bash
# Check di Vercel Dashboard:
# Project Settings → Environment Variables
# Pastikan semua ada dan correct
```

## 📱 Custom Domain (Optional)

1. Buka Project Settings → Domains
2. Add custom domain
3. Update DNS records
4. Update NEXTAUTH_URL

## 🔄 Auto-Deploy

Setelah connected ke GitHub, setiap push akan auto-deploy:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Otomatis deploy!
```

## 📊 Monitoring

-   Vercel Dashboard → Functions → View Function Logs
-   Vercel Dashboard → Analytics
-   Database dashboard (Neon/Vercel Postgres)

## 🎉 Selesai!

Website Anda sudah live di:

-   `https://linktree-kkn.vercel.app`
-   Atau custom domain yang Anda set

---

### 📞 Need Help?

-   Vercel Docs: https://vercel.com/docs
-   Next.js Deploy: https://nextjs.org/docs/deployment
-   Prisma Deploy: https://www.prisma.io/docs/guides/deployment
