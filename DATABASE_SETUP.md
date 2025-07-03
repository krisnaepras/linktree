# Database Setup untuk Linktree KKN

## Persiapan Database

1. **Update Environment Variables**

    Ganti `[YOUR-PASSWORD]` di file `.env` dengan password database Supabase Anda:

    ```env
    DATABASE_URL="postgresql://postgres.qiybqvgiwidqaduwcmhs:YOUR_ACTUAL_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    DIRECT_URL="postgresql://postgres.qiybqvgiwidqaduwcmhs:YOUR_ACTUAL_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
    ```

2. **Jalankan Migrasi Database**

    ```bash
    npm run db:migrate
    ```

3. **Generate Prisma Client**

    ```bash
    npm run db:generate
    ```

4. **Seed Database dengan Data Awal**

    ```bash
    npm run db:seed
    ```

## Struktur Database

### Users Table

-   `id`: Primary key (string/cuid)
-   `name`: Nama user
-   `email`: Email unik
-   `password`: Password yang di-hash
-   `role`: ADMIN atau USER
-   `created_at`: Timestamp pembuatan
-   `updated_at`: Timestamp update

### Linktrees Table

-   `id`: Primary key (string/cuid)
-   `user_id`: Foreign key ke users
-   `photo`: URL foto profil (optional)
-   `title`: Judul linktree
-   `slug`: URL slug unik
-   `is_active`: Status aktif
-   `created_at`: Timestamp pembuatan
-   `updated_at`: Timestamp update

### Detail_Linktrees Table

-   `id`: Primary key (string/cuid)
-   `linktree_id`: Foreign key ke linktrees
-   `category_id`: Foreign key ke categories
-   `title`: Judul link
-   `url`: URL tujuan
-   `sort_order`: Urutan tampilan
-   `is_visible`: Status visibility
-   `created_at`: Timestamp pembuatan
-   `updated_at`: Timestamp update

### Categories Table

-   `id`: Primary key (string/cuid)
-   `name`: Nama kategori unik
-   `icon`: Icon class untuk kategori (optional)
-   `created_at`: Timestamp pembuatan
-   `updated_at`: Timestamp update

## Commands Tersedia

-   `npm run db:migrate` - Jalankan migrasi database
-   `npm run db:generate` - Generate Prisma Client
-   `npm run db:seed` - Seed database dengan data awal
-   `npm run db:studio` - Buka Prisma Studio
-   `npm run db:reset` - Reset database (hati-hati!)

## Data Default yang Akan Dibuat

### Categories

-   Social Media (icon: fab fa-share-alt)
-   Website (icon: fas fa-globe)
-   E-commerce (icon: fas fa-shopping-cart)
-   Contact (icon: fas fa-address-book)
-   Portfolio (icon: fas fa-briefcase)
-   Blog (icon: fas fa-blog)
-   Video (icon: fas fa-video)
-   Music (icon: fas fa-music)
-   Other (icon: fas fa-ellipsis-h)

### Users

-   Admin: admin@linktree.com / admin123
-   Test User: user@test.com / user123

### Sample Linktree

-   Judul: "My Awesome Links"
-   Slug: "my-awesome-links"
-   Links: Instagram, Twitter, Website (icon sekarang diambil dari category)

## Penggunaan Prisma Client

```typescript
import { prisma } from "@/lib/prisma";

// Contoh query - icon sekarang diambil dari relasi category
const users = await prisma.user.findMany();
const linktree = await prisma.linktree.findUnique({
    where: { slug: "my-awesome-links" },
    include: {
        detailLinktrees: {
            include: {
                category: true // icon sekarang ada di sini
            }
        }
    }
});
```

## Catatan Penting

1. Pastikan database Supabase sudah running
2. Ganti password di file `.env` dengan password yang benar
3. Jalankan migrasi sebelum menjalankan aplikasi
4. Seed data hanya perlu dijalankan sekali
