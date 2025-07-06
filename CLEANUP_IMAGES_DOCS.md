# Cleanup Unused Images - Dokumentasi

Script untuk membersihkan file gambar yang tidak terpakai di direktori uploads.

## Fitur

-   **Dry Run Mode**: Preview file yang akan dihapus tanpa menghapusnya
-   **Multi-directory Support**: Membersihkan berbagai direktori upload
-   **Database Integration**: Memeriksa referensi file di database
-   **Content Scanning**: Memeriksa gambar yang digunakan dalam konten artikel
-   **Safe Operation**: Tidak menghapus file .gitkeep

## Direktori yang Diperiksa

1. **`/public/uploads/articles/`** - Gambar artikel
2. **`/public/uploads/category-icons/`** - Icon kategori
3. **`/public/uploads/linktree-photos/`** - Foto linktree

## Cara Penggunaan

### 1. Dry Run (Cek tanpa menghapus)

```bash
npm run cleanup:check
```

atau

```bash
node scripts/cleanup-unused-images.js
```

### 2. Cleanup Actual (Hapus file)

```bash
npm run cleanup:delete
```

atau

```bash
node scripts/cleanup-unused-images.js --delete
```

## Contoh Output

### Dry Run Mode

```
🔍 Running in DRY RUN mode (no files will be deleted)
💡 Use --delete or -d flag to actually delete files

🧹 Starting DRY RUN of unused images...
🔍 DRY RUN MODE - Files will not be deleted, only listed

📁 Checking Articles...
   📊 Found 3 files
   📋 1 files are referenced in database
   🔍 Would delete: unused-image.png (1.03 MB)
   ✅ Kept: featured-image.png (in use)

📊 DRY RUN Summary:
   🗑️  Files to be deleted: 1
   💾 Space to be freed: 1.03 MB
   ✅ DRY RUN completed!

💡 To actually delete these files, run:
   node scripts/cleanup-unused-images.js --delete
```

### Cleanup Mode

```
🧹 Starting CLEANUP of unused images...

📁 Checking Articles...
   📊 Found 3 files
   📋 1 files are referenced in database
   🗑️  Deleted: unused-image.png (1.03 MB)
   ✅ Kept: featured-image.png (in use)

📊 CLEANUP Summary:
   🗑️  Files deleted: 1
   💾 Space freed: 1.03 MB
   ✅ CLEANUP completed!
```

## Logika Pengecekan

### Articles

-   Memeriksa field `featuredImage` di tabel `articles`
-   Memeriksa tag `<img>` dalam konten artikel
-   Hanya mempertahankan file yang dimulai dengan `/uploads/articles/`

### Category Icons

-   Memeriksa field `icon` di tabel `categories`
-   Hanya mempertahankan file yang dimulai dengan `/uploads/category-icons/`

### Linktree Photos

-   Memeriksa field `photo` di tabel `linktrees`
-   Hanya mempertahankan file yang dimulai dengan `/uploads/linktree-photos/`

## Keamanan

-   **Backup direkomendasikan** sebelum menjalankan cleanup
-   **Dry run terlebih dahulu** untuk memastikan file yang akan dihapus
-   **File .gitkeep tidak akan dihapus** untuk menjaga struktur direktori
-   **Database connection** memastikan data referensi akurat

## Kapan Menggunakan

1. **Setelah migrasi data** - Membersihkan file lama yang tidak terpakai
2. **Maintenance rutin** - Menghemat ruang disk server
3. **Sebelum backup** - Mengurangi ukuran backup
4. **Setelah penghapusan konten** - Membersihkan file yang tertinggal

## Troubleshooting

### Error: "Directory doesn't exist"

```
⚠️  Directory doesn't exist: /path/to/uploads
```

**Solusi**: Pastikan direktori uploads ada dan dapat diakses

### Error: "Database connection failed"

```
❌ Error during cleanup: Database connection failed
```

**Solusi**: Pastikan database berjalan dan environment variables benar

### Error: "Permission denied"

```
❌ Error deleting file.png: Permission denied
```

**Solusi**: Pastikan aplikasi memiliki permission write ke direktori uploads

## Integrasi dengan CI/CD

Script ini dapat diintegrasikan dalam pipeline deployment:

```yaml
# .github/workflows/cleanup.yml
- name: Cleanup unused images
  run: |
      npm run cleanup:check
      npm run cleanup:delete
```

## Monitoring

Monitor ruang disk yang dihemat:

```bash
# Sebelum cleanup
du -sh public/uploads/

# Setelah cleanup
du -sh public/uploads/
```

---

**⚠️ Perhatian**: Selalu jalankan dry run terlebih dahulu dan pastikan backup tersedia sebelum menjalankan cleanup actual.
