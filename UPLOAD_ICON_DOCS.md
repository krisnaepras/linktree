# Upload Icon Kategori - Dokumentasi

## Fitur Upload Icon Kategori

Sistem sekarang mendukung upload gambar untuk icon kategori selain emoji. Fitur ini hanya tersedia untuk admin.

### Fitur yang Tersedia

1. **Emoji Icon**: Input text untuk emoji (contoh: 📱, 🌐, 🛒)
2. **Upload Gambar**: Upload file gambar (JPG, PNG, GIF, WebP)

### Spesifikasi Upload

-   **Format yang didukung**: JPEG, JPG, PNG, GIF, WebP
-   **Ukuran maksimal**: 2MB
-   **Folder penyimpanan**: `/public/uploads/category-icons/`
-   **Penamaan file**: UUID random + ekstensi asli

### Cara Penggunaan

#### Untuk Admin:

1. Login sebagai admin
2. Masuk ke **Admin Dashboard** → **Kelola Kategori**
3. Saat membuat/edit kategori, pilih salah satu:
    - **Emoji Icon**: Masukkan emoji langsung (📱)
    - **Upload Gambar**: Pilih file gambar dari komputer

#### Preview dan Validasi

-   **Preview**: Gambar akan ditampilkan setelah dipilih
-   **Validasi**: File akan divalidasi format dan ukuran
-   **Error handling**: Pesan error jika file tidak valid

### Tampilan Icon

#### Di Halaman Admin

-   Icon emoji: ditampilkan sebagai text
-   Icon gambar: ditampilkan sebagai thumbnail 32x32px

#### Di Halaman Publik Linktree

-   Icon emoji: ditampilkan sebagai text berukuran 2xl
-   Icon gambar: ditampilkan sebagai gambar 32x32px dengan border rounded

#### Di Dropdown Kategori

-   Hanya emoji yang ditampilkan di dropdown (HTML select tidak support gambar)
-   Icon gambar tetap tersimpan dan ditampilkan di tempat lain

### API Endpoints

#### Upload Icon

```
POST /api/upload/category-icon
Authorization: Admin only
Content-Type: multipart/form-data
Body: FormData dengan field 'icon'
```

#### Response Success

```json
{
    "success": true,
    "filePath": "/uploads/category-icons/abc123.jpg",
    "fileName": "abc123.jpg"
}
```

#### Response Error

```json
{
    "error": "File too large. Maximum size is 2MB."
}
```

### Database

Icon disimpan sebagai string di field `icon` pada tabel `categories`:

-   Emoji: `"📱"`
-   Gambar: `"/uploads/category-icons/uuid.jpg"`

### File Structure

```
public/
  uploads/
    category-icons/
      .gitkeep
      uuid1.jpg
      uuid2.png
      uuid3.gif
```

### Security

-   **Authorization**: Hanya admin yang dapat upload
-   **Validation**: File type dan size validation
-   **File naming**: UUID untuk mencegah conflict dan path traversal
-   **Directory**: Restricted ke folder category-icons

### Penghapusan File

-   File lama otomatis dihapus saat kategori diupdate dengan icon baru
-   File dihapus saat kategori didelete
-   Menggunakan fungsi `deleteCategoryIcon()` dari `lib/upload.ts`

### Error Handling

1. **File tidak dipilih**: "No file uploaded"
2. **Format salah**: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
3. **File terlalu besar**: "File too large. Maximum size is 2MB."
4. **Server error**: "Failed to upload file"

### Pengembangan Selanjutnya

-   [ ] Image resizing otomatis
-   [ ] Compress gambar sebelum upload
-   [ ] Support SVG format
-   [ ] Bulk upload multiple icons
-   [ ] Icon library bawaan

---

**Note**: Pastikan folder `/public/uploads/category-icons/` memiliki permission write untuk aplikasi.
