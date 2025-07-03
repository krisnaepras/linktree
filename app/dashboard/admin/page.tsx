"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Swal from "sweetalert2";

const categorySchema = z.object({
    name: z
        .string()
        .min(1, "Nama kategori harus diisi")
        .max(50, "Nama kategori maksimal 50 karakter"),
    icon: z.string().optional()
});

type CategoryFormData = z.infer<typeof categorySchema>;

type Category = {
    id: string;
    name: string;
    icon: string | null;
    _count: {
        detailLinktrees: number;
    };
};

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null
    );
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema)
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated" && session?.user?.role !== "ADMIN") {
            router.push("/dashboard");
            return;
        }

        if (status === "authenticated") {
            fetchCategories();
        }
    }, [status, router, session]);

    const fetchCategories = async () => {
        try {
            const response = await fetch("/api/admin/categories");
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const uploadIconFile = async (): Promise<string | null> => {
        if (!selectedFile) return null;

        const formData = new FormData();
        formData.append("icon", selectedFile);

        try {
            const response = await fetch("/api/upload/category-icon", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                return result.filePath;
            } else {
                const error = await response.json();
                setError(error.error || "Failed to upload file");
                return null;
            }
        } catch (error) {
            setError("Failed to upload file");
            return null;
        }
    };

    const onSubmit = async (data: CategoryFormData) => {
        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            let iconPath = data.icon; // Use text icon if provided

            // If a file is selected, upload it first
            if (selectedFile) {
                const uploadedPath = await uploadIconFile();
                if (uploadedPath === null) {
                    setIsLoading(false);
                    return;
                }
                iconPath = uploadedPath;
            }

            const method = editingCategory ? "PATCH" : "POST";
            const url = editingCategory
                ? `/api/admin/categories/${editingCategory.id}`
                : "/api/admin/categories";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ...data, icon: iconPath })
            });

            if (response.ok) {
                setSuccessMessage(
                    editingCategory
                        ? "Kategori berhasil diperbarui!"
                        : "Kategori berhasil ditambahkan!"
                );
                reset();
                setEditingCategory(null);
                setSelectedFile(null);
                setPreviewUrl(null);
                fetchCategories();
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Terjadi kesalahan");
            }
        } catch (error) {
            setError("Terjadi kesalahan pada server");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        reset({
            name: category.name,
            icon: category.icon || ""
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        setError("");
        setSuccessMessage("");
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
        reset();
        setSelectedFile(null);
        setPreviewUrl(null);
        setError("");
        setSuccessMessage("");
    };

    const handleDelete = async (categoryId: string) => {
        const result = await Swal.fire({
            title: "Hapus Kategori?",
            text: "Tindakan ini tidak dapat dibatalkan. Kategori akan dihapus permanen.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            reverseButtons: true
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            const response = await fetch(
                `/api/admin/categories/${categoryId}`,
                {
                    method: "DELETE"
                }
            );

            if (response.ok) {
                await Swal.fire({
                    title: "Berhasil!",
                    text: "Kategori berhasil dihapus.",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                });
                setSuccessMessage("Kategori berhasil dihapus!");
                fetchCategories();
            } else {
                const errorData = await response.json();
                await Swal.fire({
                    title: "Gagal!",
                    text:
                        errorData.error ||
                        "Terjadi kesalahan saat menghapus kategori.",
                    icon: "error",
                    confirmButtonColor: "#dc2626"
                });
                setError(errorData.error || "Terjadi kesalahan");
            }
        } catch (error) {
            await Swal.fire({
                title: "Gagal!",
                text: "Terjadi kesalahan pada server.",
                icon: "error",
                confirmButtonColor: "#dc2626"
            });
            setError("Terjadi kesalahan pada server");
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session || session.user.role !== "ADMIN") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Akses Ditolak
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Anda tidak memiliki izin untuk mengakses halaman ini.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/dashboard"
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                ← Kembali ke Dashboard
                            </Link>
                            <h1 className="text-xl font-semibold text-gray-900">
                                Admin Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                Admin: {session.user.name}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ADMIN
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Kelola Kategori
                    </h2>
                    <p className="text-gray-600">
                        Tambah, edit, dan hapus kategori yang tersedia untuk
                        pengguna
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add/Edit Category Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {editingCategory
                                    ? "Edit Kategori"
                                    : "Tambah Kategori"}
                            </h3>

                            {error && (
                                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                    {error}
                                </div>
                            )}

                            {successMessage && (
                                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                                    {successMessage}
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Nama Kategori *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        {...register("name")}
                                        placeholder="Contoh: Social Media"
                                        className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.name.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Icon Kategori
                                    </label>

                                    {/* Option to use emoji or upload image */}
                                    <div className="space-y-4">
                                        <div>
                                            <label
                                                htmlFor="icon"
                                                className="block text-sm font-medium text-gray-600 mb-1"
                                            >
                                                Emoji Icon
                                            </label>
                                            <input
                                                type="text"
                                                id="icon"
                                                {...register("icon")}
                                                placeholder="📱"
                                                className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                Atau gunakan emoji sebagai icon
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                Upload Gambar Icon
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                Format: JPG, PNG, GIF, WebP.
                                                Maksimal 2MB
                                            </p>

                                            {/* Preview */}
                                            {previewUrl && (
                                                <div className="mt-2">
                                                    <img
                                                        src={previewUrl}
                                                        alt="Preview"
                                                        className="w-16 h-16 object-cover rounded-lg border"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {errors.icon && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.icon.message}
                                        </p>
                                    )}
                                </div>

                                <div className="flex space-x-3">
                                    {editingCategory && (
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Batal
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isLoading
                                            ? "Menyimpan..."
                                            : editingCategory
                                            ? "Perbarui"
                                            : "Tambah"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Categories List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Daftar Kategori ({categories.length})
                            </h3>

                            {categories.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">
                                        Belum ada kategori. Tambahkan kategori
                                        pertama!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {categories.map((category) => (
                                        <div
                                            key={category.id}
                                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                                    {category.icon ? (
                                                        category.icon.startsWith(
                                                            "/uploads/"
                                                        ) ? (
                                                            <img
                                                                src={
                                                                    category.icon
                                                                }
                                                                alt={
                                                                    category.name
                                                                }
                                                                className="w-10 h-10 object-cover rounded-lg border"
                                                            />
                                                        ) : (
                                                            <span className="text-3xl">
                                                                {category.icon}
                                                            </span>
                                                        )
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                            <span className="text-gray-400 text-xl">
                                                                📄
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {category.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        {
                                                            category._count
                                                                .detailLinktrees
                                                        }{" "}
                                                        link menggunakan
                                                        kategori ini
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleEdit(category)
                                                    }
                                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            category.id
                                                        )
                                                    }
                                                    disabled={
                                                        category._count
                                                            .detailLinktrees > 0
                                                    }
                                                    className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title={
                                                        category._count
                                                            .detailLinktrees > 0
                                                            ? "Tidak dapat menghapus kategori yang sedang digunakan"
                                                            : "Hapus kategori"
                                                    }
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
