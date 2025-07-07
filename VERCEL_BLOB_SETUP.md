# Upload System Configuration untuk Vercel

## Masalah yang Dialami

Ketika menambahkan kategori dengan mengupload gambar dari lokal di Vercel production, upload gagal karena:

1. **Tidak ada Vercel Blob Token** di environment variables
2. **Konfigurasi Vercel Blob** belum lengkap
3. **Environment variables** produksi belum diset

## Solusi Setup

### 1. Setup Vercel Blob Token

1. **Masuk ke Vercel Dashboard**

    - Buka https://vercel.com/dashboard
    - Pilih project `linktree-kkn`

2. **Buat Vercel Blob Storage**

    - Ke menu "Storage" di dashboard
    - Klik "Create Database" → "Blob"
    - Nama: `linktree-uploads`
    - Klik "Create"

3. **Copy Blob Token**
    - Setelah dibuat, copy `BLOB_READ_WRITE_TOKEN`
    - Contoh: `vercel_blob_rw_Abc123Def456_XyZ789`

### 2. Set Environment Variables di Vercel

1. **Masuk ke Project Settings**

    - Vercel Dashboard → Project → Settings → Environment Variables

2. **Tambahkan Variable Baru**

    ```
    Key: BLOB_READ_WRITE_TOKEN
    Value: vercel_blob_rw_Abc123Def456_XyZ789
    ```

3. **Set untuk Production**
    - Pilih "Production" environment
    - Klik "Add"

### 3. Update File .env.local (Development)

```env
# File Upload - Vercel Blob (Required for production)
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token-here"
```

### 4. Redeploy Project

```bash
# Trigger redeploy dari terminal
git add .
git commit -m "Add Vercel Blob configuration"
git push origin main
```

Atau dari Vercel Dashboard → Deployments → Redeploy

## Cara Kerja Upload System

### Development (Local)

-   Upload disimpan di `public/uploads/category-icons/`
-   Path: `/uploads/category-icons/filename.ext`

### Production (Vercel)

-   Upload menggunakan Vercel Blob
-   URL: `https://xyz.public.blob.vercel-storage.com/category-icons/filename.ext`

## Testing Upload

1. **Buka Admin Panel**

    - `/admin/categories`

2. **Tambah Kategori Baru**

    - Pilih "Upload" tab
    - Upload gambar PNG/JPG/SVG (max 2MB)
    - Simpan

3. **Verifikasi**
    - Gambar harus muncul di daftar kategori
    - URL gambar menggunakan Vercel Blob domain

## Troubleshooting

### Error: "No file uploaded"

-   Pastikan file dipilih sebelum submit
-   Cek format file (PNG, JPG, SVG, WebP)
-   Cek ukuran file (max 2MB)

### Error: "Failed to upload to cloud storage"

-   Vercel Blob token tidak valid
-   Periksa environment variables di Vercel
-   Pastikan token tidak expired

### Error: "Unauthorized"

-   User tidak memiliki role ADMIN/SUPERADMIN
-   Session expired, login ulang

## File Upload Limits

-   **Ukuran maksimal**: 2MB
-   **Format yang didukung**: PNG, JPG, JPEG, SVG, WebP, GIF
-   **Penyimpanan**:
    -   Development: Local storage
    -   Production: Vercel Blob

## Keamanan

-   Upload hanya untuk ADMIN/SUPERADMIN
-   Validasi file type dan size
-   Unique filename dengan UUID
-   Public access untuk serving gambar

---

**Setelah setup selesai, emoji upload sudah aman, file upload dari lokal juga akan berfungsi di production.**
