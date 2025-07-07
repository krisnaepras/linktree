# Instruksi Migrasi: Memindahkan Icon ke Tabel Categories

## Perubahan yang Dilakukan

### 1. Struktur Database

-   **Menghapus** kolom `icon` dari tabel `detail_linktrees`
-   **Menambahkan** kolom `icon` ke tabel `categories`

### 2. Perubahan Schema Prisma

**Sebelum:**

```prisma
model DetailLinktree {
  id         String   @id @default(cuid())
  linktreeId String   @map("linktree_id")
  categoryId String   @map("category_id")
  icon       String?  // ← Kolom ini dihapus
  title      String
  url        String
  sortOrder  Int      @map("sort_order")
  isVisible  Boolean  @default(true) @map("is_visible")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")
  // ...
}

model Category {
  id        String   @id @default(cuid())
  name      String   @unique
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  // ...
}
```

**Sesudah:**

```prisma
model DetailLinktree {
  id         String   @id @default(cuid())
  linktreeId String   @map("linktree_id")
  categoryId String   @map("category_id")
  // icon dihapus dari sini
  title      String
  url        String
  sortOrder  Int      @map("sort_order")
  isVisible  Boolean  @default(true) @map("is_visible")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")
  // ...
}

model Category {
  id        String   @id @default(cuid())
  name      String   @unique
  icon      String?  // ← Kolom ini ditambahkan
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  // ...
}
```

### 3. Perubahan Seed Data

**Categories dengan icon:**

```typescript
const categories = [
    { name: "Social Media", icon: "fab fa-share-alt" },
    { name: "Website", icon: "fas fa-globe" },
    { name: "E-commerce", icon: "fas fa-shopping-cart" },
    { name: "Contact", icon: "fas fa-address-book" },
    { name: "Portfolio", icon: "fas fa-briefcase" },
    { name: "Blog", icon: "fas fa-blog" },
    { name: "Video", icon: "fas fa-video" },
    { name: "Music", icon: "fas fa-music" },
    { name: "Other", icon: "fas fa-ellipsis-h" }
];
```

**Detail links tanpa icon:**

```typescript
// Icon sekarang diambil dari relasi category
await prisma.detailLinktree.createMany({
    data: [
        {
            linktreeId: sampleLinktree.id,
            categoryId: socialMediaCategory.id,
            // icon: 'fab fa-instagram', // ← Dihapus
            title: "Instagram",
            url: "https://instagram.com/username",
            sortOrder: 1,
            isVisible: true
        }
        // ...
    ]
});
```

## Cara Menjalankan Migrasi

### 1. Persiapan

Pastikan password database sudah diatur di file `.env`:

```env
DATABASE_URL="postgresql://postgres.qiybqvgiwidqaduwcmhs:YOUR_ACTUAL_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### 2. Jalankan Migrasi

```bash
npm run db:migrate
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Seed Data Baru

```bash
npm run db:seed
```

## Cara Menggunakan Icon dari Category

### Query untuk mendapatkan icon:

```typescript
const linktree = await prisma.linktree.findUnique({
    where: { slug: "my-awesome-links" },
    include: {
        detailLinktrees: {
            include: {
                category: true // icon ada di category.icon
            }
        }
    }
});

// Mengakses icon:
linktree.detailLinktrees.forEach((link) => {
    console.log(`${link.title}: ${link.category.icon}`);
});
```

### Keuntungan Perubahan Ini:

1. **Konsistensi**: Semua link dalam kategori yang sama memiliki icon yang sama
2. **Maintainability**: Mengganti icon kategori hanya perlu dilakukan di satu tempat
3. **Normalisasi**: Struktur database lebih normalized
4. **Efisiensi**: Mengurangi duplikasi data icon

## Catatan Penting

-   Pastikan aplikasi frontend diupdate untuk mengambil icon dari `category.icon` bukan `detailLinktree.icon`
-   Backup database sebelum menjalankan migrasi
-   Test semua fitur setelah migrasi selesai
