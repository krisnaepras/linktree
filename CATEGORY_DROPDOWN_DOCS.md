# CategoryDropdown Component Documentation

## Overview

Komponen `CategoryDropdown` adalah custom dropdown yang dibuat khusus untuk menampilkan kategori beserta icon-nya di form create/edit link. Komponen ini mengatasi keterbatasan HTML `<select>` yang tidak bisa menampilkan gambar di dalam `<option>`.

## Features

-   ✅ Menampilkan icon kategori (emoji atau gambar upload)
-   ✅ Keyboard navigation (Arrow keys, Enter, Escape)
-   ✅ Click outside to close
-   ✅ Loading state
-   ✅ Error handling untuk gambar yang gagal dimuat
-   ✅ Responsive design
-   ✅ Accessibility-friendly
-   ✅ Hover dan focus states

## Props

### CategoryDropdownProps

```typescript
interface CategoryDropdownProps {
    categories: Category[]; // Array kategori yang akan ditampilkan
    selectedCategoryId: string; // ID kategori yang dipilih
    onSelect: (categoryId: string) => void; // Callback ketika kategori dipilih
    placeholder?: string; // Placeholder text (default: "Pilih kategori")
    error?: string; // Error message
    disabled?: boolean; // Disabled state (default: false)
    loading?: boolean; // Loading state (default: false)
}
```

### Category Type

```typescript
type Category = {
    id: string;
    name: string;
    icon: string | null; // Bisa berupa emoji atau path gambar (/uploads/...)
};
```

## Usage

### Basic Usage

```tsx
import CategoryDropdown from "@/components/CategoryDropdown";

function MyForm() {
    const [selectedCategory, setSelectedCategory] = useState("");

    return (
        <CategoryDropdown
            categories={categories}
            selectedCategoryId={selectedCategory}
            onSelect={setSelectedCategory}
            placeholder="Pilih kategori"
        />
    );
}
```

### With React Hook Form

```tsx
import { useForm } from "react-hook-form";
import CategoryDropdown from "@/components/CategoryDropdown";

function MyForm() {
    const {
        setValue,
        watch,
        formState: { errors }
    } = useForm();
    const categoryId = watch("categoryId") || "";

    return (
        <CategoryDropdown
            categories={categories}
            selectedCategoryId={categoryId}
            onSelect={(id) => setValue("categoryId", id)}
            placeholder="Pilih kategori"
            error={errors.categoryId?.message}
            loading={isFetching}
        />
    );
}
```

## Keyboard Navigation

-   **Arrow Down**: Pindah ke opsi berikutnya
-   **Arrow Up**: Pindah ke opsi sebelumnya
-   **Enter**: Pilih opsi yang di-highlight
-   **Escape**: Tutup dropdown

## Icon Handling

Komponen secara otomatis mendeteksi jenis icon:

-   **Emoji**: Ditampilkan sebagai text dengan ukuran yang lebih besar
-   **Upload Image**: Ditampilkan sebagai gambar menggunakan Next.js Image component
-   **Fallback**: Jika gambar gagal dimuat, akan disembunyikan

## Styling

-   Menggunakan Tailwind CSS
-   Consistent dengan design system aplikasi
-   Responsive breakpoints
-   Hover dan focus states yang jelas
-   Error states dengan warna merah

## Implementation Notes

### Dalam Form Create Link

File: `app/dashboard/links/create/page.tsx`

```tsx
// Replace standard select dengan CategoryDropdown
<CategoryDropdown
    categories={categories}
    selectedCategoryId={categoryId}
    onSelect={(id) => setValue("categoryId", id)}
    placeholder="Pilih kategori"
    error={errors.categoryId?.message}
    loading={isFetching}
/>
```

### Dalam Form Edit Link

File: `app/dashboard/links/edit/[id]/page.tsx`

```tsx
// Replace standard select dengan CategoryDropdown
<CategoryDropdown
    categories={categories}
    selectedCategoryId={categoryId}
    onSelect={(id) => setValue("categoryId", id)}
    placeholder="Pilih kategori"
    error={errors.categoryId?.message}
    loading={isFetching}
/>
```

## Dependencies

-   React (hooks: useState, useRef, useEffect)
-   Next.js Image component
-   @heroicons/react (untuk chevron icons)
-   Tailwind CSS untuk styling

## Browser Support

-   Modern browsers yang mendukung:
    -   CSS Grid dan Flexbox
    -   addEventListener/removeEventListener
    -   ES6+ features

## Future Enhancements

-   Search/filter functionality
-   Multiple selection mode
-   Virtual scrolling untuk performa dengan banyak kategori
-   Custom icon upload langsung dari dropdown
-   Drag and drop untuk reorder kategori
