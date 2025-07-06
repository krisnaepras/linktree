"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Icon } from "@iconify/react";
import AdminLayout from "@/components/AdminLayout";
import Swal from "sweetalert2";
import Image from "next/image";

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
    createdAt: string;
    _count: {
        detailLinktrees: number;
    };
};

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CategoryFormData) => Promise<void>;
    category?: Category | null;
    isLoading?: boolean;
}

interface CategoryDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: Category | null;
    isLoading?: boolean;
}

function CategoryModal({
    isOpen,
    onClose,
    onSave,
    category,
    isLoading
}: CategoryModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [iconType, setIconType] = useState<"emoji" | "upload">("emoji");

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: category?.name || "",
            icon: category?.icon || ""
        }
    });

    const watchedIcon = watch("icon");

    useEffect(() => {
        if (category) {
            reset({
                name: category.name,
                icon: category.icon || ""
            });
            if (category.icon && category.icon.startsWith("/uploads/")) {
                setIconType("upload");
                setPreviewUrl(category.icon);
            } else {
                setIconType("emoji");
            }
        } else {
            reset({
                name: "",
                icon: ""
            });
            setIconType("emoji");
            setSelectedFile(null);
            setPreviewUrl(null);
        }
    }, [category, reset]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setValue("icon", "");
        }
    };

    const onSubmit = async (data: CategoryFormData) => {
        let finalData = { ...data };

        if (iconType === "upload" && selectedFile) {
            // Upload file first
            const formData = new FormData();
            formData.append("icon", selectedFile);

            try {
                const uploadResponse = await fetch(
                    "/api/upload/category-icon",
                    {
                        method: "POST",
                        body: formData
                    }
                );

                if (uploadResponse.ok) {
                    const result = await uploadResponse.json();
                    finalData.icon = result.filePath;
                } else {
                    throw new Error("Upload failed");
                }
            } catch (error) {
                Swal.fire({
                    title: "Error",
                    text: "Gagal mengupload file icon",
                    icon: "error"
                });
                return;
            }
        }

        await onSave(finalData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto transform animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {category ? "Edit Kategori" : "Tambah Kategori"}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {category
                                ? "Perbarui informasi kategori"
                                : "Buat kategori baru untuk mengorganisir link"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <Icon icon="ph:x" className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="p-6 space-y-5"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nama Kategori *
                        </label>
                        <input
                            type="text"
                            {...register("name")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Contoh: Social Media, E-commerce"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Icon
                        </label>

                        <div className="flex space-x-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setIconType("emoji")}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                    iconType === "emoji"
                                        ? "bg-blue-100 text-blue-700 border-2 border-blue-200"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent"
                                }`}
                            >
                                📱 Emoji
                            </button>
                            <button
                                type="button"
                                onClick={() => setIconType("upload")}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                    iconType === "upload"
                                        ? "bg-blue-100 text-blue-700 border-2 border-blue-200"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent"
                                }`}
                            >
                                📤 Upload
                            </button>
                        </div>

                        {iconType === "emoji" ? (
                            <div>
                                <input
                                    type="text"
                                    {...register("icon")}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="📱 🌐 🛒 📧 💼"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Masukkan emoji yang akan digunakan sebagai
                                    icon kategori
                                </p>
                                {watchedIcon && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg flex items-center space-x-3">
                                        <span className="text-2xl">
                                            {watchedIcon}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            Preview icon
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Upload gambar (PNG, JPG, SVG) maksimal 2MB
                                </p>
                                {previewUrl && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg flex items-center space-x-3">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-8 h-8 object-cover rounded"
                                        />
                                        <span className="text-sm text-gray-600">
                                            Preview icon
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <Icon
                                        icon="ph:spinner"
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    />
                                    Menyimpan...
                                </span>
                            ) : category ? (
                                "Perbarui"
                            ) : (
                                "Tambah"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function CategoryDetailModal({
    isOpen,
    onClose,
    category,
    isLoading
}: CategoryDetailModalProps) {
    if (!isOpen) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Detail Kategori
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Icon icon="ph:x" className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : category ? (
                        <div className="space-y-6">
                            {/* Category Icon & Basic Info */}
                            <div className="text-center">
                                <div className="w-24 h-24 flex items-center justify-center mx-auto mb-4 bg-gray-100 rounded-lg">
                                    {category.icon ? (
                                        category.icon.startsWith(
                                            "/uploads/"
                                        ) ? (
                                            <Image
                                                src={category.icon}
                                                alt={category.name}
                                                width={60}
                                                height={60}
                                                className="object-cover rounded-lg"
                                            />
                                        ) : (
                                            <span className="text-4xl">
                                                {category.icon}
                                            </span>
                                        )
                                    ) : (
                                        <span className="text-4xl text-gray-400">
                                            📁
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {category.name}
                                </h2>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mt-2">
                                    Kategori Aktif
                                </span>
                            </div>

                            {/* Category Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">
                                        Informasi Kategori
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                ID Kategori:
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {category.id}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Nama:
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {category.name}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Icon Type:
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {category.icon?.startsWith(
                                                    "/uploads/"
                                                )
                                                    ? "Upload"
                                                    : "Emoji"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">
                                        Statistik Penggunaan
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Total Links:
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {
                                                    category._count
                                                        .detailLinktrees
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Dibuat:
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatDate(category.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Status:
                                            </span>
                                            <span className="text-sm font-medium text-green-600">
                                                Aktif
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Icon Preview */}
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-3">
                                    Preview Icon
                                </h4>
                                <div className="flex items-center justify-center">
                                    <div className="w-16 h-16 flex items-center justify-center bg-white rounded-lg shadow-sm border">
                                        {category.icon ? (
                                            category.icon.startsWith(
                                                "/uploads/"
                                            ) ? (
                                                <Image
                                                    src={category.icon}
                                                    alt={category.name}
                                                    width={40}
                                                    height={40}
                                                    className="object-cover rounded"
                                                />
                                            ) : (
                                                <span className="text-3xl">
                                                    {category.icon}
                                                </span>
                                            )
                                        ) : (
                                            <span className="text-3xl text-gray-400">
                                                📁
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Usage Statistics */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-3">
                                    Analitik
                                </h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {category._count.detailLinktrees}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Links Dibuat
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-indigo-600">
                                            {Math.floor(
                                                (Date.now() -
                                                    new Date(
                                                        category.createdAt
                                                    ).getTime()) /
                                                    (1000 * 60 * 60 * 24)
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Hari Aktif
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {category._count.detailLinktrees > 0
                                                ? "Popular"
                                                : "Baru"}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Status
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">
                                Data kategori tidak ditemukan.
                            </p>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminCategoriesPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailCategory, setDetailCategory] = useState<Category | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Sorting state
    const [sortBy, setSortBy] = useState<
        "name" | "createdAt" | "detailLinktrees"
    >("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/categories");
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            Swal.fire({
                title: "Error",
                text: "Gagal memuat data kategori",
                icon: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCategory = async (data: CategoryFormData) => {
        setIsSubmitting(true);
        try {
            const url = editingCategory
                ? `/api/admin/categories/${editingCategory.id}`
                : "/api/admin/categories";

            const method = editingCategory ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                await fetchCategories();
                setIsModalOpen(false);
                setEditingCategory(null);

                Swal.fire({
                    title: "Berhasil!",
                    text: `Kategori berhasil ${
                        editingCategory ? "diupdate" : "ditambahkan"
                    }`,
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                const error = await response.json();
                throw new Error(error.error || "Gagal menyimpan kategori");
            }
        } catch (error) {
            console.error("Error saving category:", error);
            Swal.fire({
                title: "Error",
                text:
                    error instanceof Error
                        ? error.message
                        : "Gagal menyimpan kategori",
                icon: "error"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateCategory = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleViewCategoryDetail = (category: Category) => {
        router.push(`/admin/categories/${category.id}`);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setDetailCategory(null);
    };

    const handleDeleteCategory = async (category: Category) => {
        const result = await Swal.fire({
            title: "Hapus Kategori?",
            text: `Apakah Anda yakin ingin menghapus kategori "${category.name}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(
                    `/api/admin/categories/${category.id}`,
                    {
                        method: "DELETE"
                    }
                );

                if (response.ok) {
                    await fetchCategories();
                    Swal.fire({
                        title: "Berhasil!",
                        text: "Kategori berhasil dihapus",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    const error = await response.json();
                    throw new Error(error.error || "Gagal menghapus kategori");
                }
            } catch (error) {
                console.error("Error deleting category:", error);
                Swal.fire({
                    title: "Error",
                    text:
                        error instanceof Error
                            ? error.message
                            : "Gagal menghapus kategori",
                    icon: "error"
                });
            }
        }
    };

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sorting function
    const handleSort = (column: "name" | "createdAt" | "detailLinktrees") => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
        setCurrentPage(1); // Reset to first page when sorting
    };

    // Sort categories
    const sortedCategories = [...filteredCategories].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
            case "name":
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
            case "createdAt":
                aValue = new Date(a.createdAt).getTime();
                bValue = new Date(b.createdAt).getTime();
                break;
            case "detailLinktrees":
                aValue = a._count.detailLinktrees;
                bValue = b._count.detailLinktrees;
                break;
            default:
                return 0;
        }

        if (sortOrder === "asc") {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Pagination
    const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCategories = sortedCategories.slice(startIndex, endIndex);

    // Pagination functions
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const getPaginationRange = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, "...");
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push("...", totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const getSortIcon = (column: "name" | "createdAt" | "detailLinktrees") => {
        if (sortBy !== column) {
            return (
                <Icon
                    icon="ph:arrows-up-down"
                    className="w-4 h-4 text-gray-400"
                />
            );
        }

        if (sortOrder === "asc") {
            return (
                <Icon icon="ph:caret-up" className="w-4 h-4 text-blue-600" />
            );
        } else {
            return (
                <Icon icon="ph:caret-down" className="w-4 h-4 text-blue-600" />
            );
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Kelola Kategori
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Atur dan kelola kategori untuk mengorganisir
                                link-link pengguna
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <Icon
                                    icon="ph:magnifying-glass"
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                                />
                                <input
                                    type="text"
                                    placeholder="Cari kategori..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={handleCreateCategory}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Icon icon="ph:plus" className="w-4 h-4 mr-2" />
                                Tambah Kategori
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                            Menampilkan{" "}
                            <span className="font-medium text-gray-900">
                                {startIndex + 1}-
                                {Math.min(endIndex, sortedCategories.length)}
                            </span>{" "}
                            dari{" "}
                            <span className="font-medium text-gray-900">
                                {sortedCategories.length}
                            </span>{" "}
                            kategori
                            {searchTerm && (
                                <span className="ml-2 text-blue-600">
                                    (difilter dari {categories.length} total
                                    kategori)
                                </span>
                            )}
                        </span>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>
                </div>

                {/* Categories Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleSort("name")}
                                            className="flex items-center space-x-1 hover:text-gray-700 focus:outline-none focus:text-gray-700"
                                        >
                                            <span>Kategori</span>
                                            {getSortIcon("name")}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Icon
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() =>
                                                handleSort("detailLinktrees")
                                            }
                                            className="flex items-center space-x-1 hover:text-gray-700 focus:outline-none focus:text-gray-700"
                                        >
                                            <span>Jumlah Link</span>
                                            {getSortIcon("detailLinktrees")}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() =>
                                                handleSort("createdAt")
                                            }
                                            className="flex items-center space-x-1 hover:text-gray-700 focus:outline-none focus:text-gray-700"
                                        >
                                            <span>Dibuat</span>
                                            {getSortIcon("createdAt")}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedCategories.map((category) => (
                                    <tr
                                        key={category.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {category.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    {category.icon ? (
                                                        category.icon.startsWith(
                                                            "/uploads/"
                                                        ) ? (
                                                            <Image
                                                                src={
                                                                    category.icon
                                                                }
                                                                alt={
                                                                    category.name
                                                                }
                                                                width={20}
                                                                height={20}
                                                                className="rounded"
                                                            />
                                                        ) : (
                                                            <span className="text-lg">
                                                                {category.icon}
                                                            </span>
                                                        )
                                                    ) : (
                                                        <Icon
                                                            icon="ph:tag"
                                                            className="w-4 h-4 text-gray-400"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-900">
                                                    {
                                                        category._count
                                                            .detailLinktrees
                                                    }
                                                </span>
                                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {category._count
                                                        .detailLinktrees === 1
                                                        ? "link"
                                                        : "links"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(category.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleViewCategoryDetail(
                                                            category
                                                        )
                                                    }
                                                    className="inline-flex items-center px-3 py-1.5 border border-blue-300 shadow-sm text-xs font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    title="Lihat detail kategori"
                                                >
                                                    <Icon
                                                        icon="ph:eye"
                                                        className="w-4 h-4 mr-1"
                                                    />
                                                    Detail
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleEditCategory(
                                                            category
                                                        )
                                                    }
                                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    title="Edit kategori"
                                                >
                                                    <Icon
                                                        icon="ph:pencil"
                                                        className="w-4 h-4 mr-1"
                                                    />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteCategory(
                                                            category
                                                        )
                                                    }
                                                    disabled={
                                                        category._count
                                                            .detailLinktrees > 0
                                                    }
                                                    className={`inline-flex items-center px-3 py-1.5 border shadow-sm text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                                        category._count
                                                            .detailLinktrees > 0
                                                            ? "border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed"
                                                            : "border-red-300 text-red-700 bg-white hover:bg-red-50 focus:ring-red-500"
                                                    }`}
                                                    title={
                                                        category._count
                                                            .detailLinktrees > 0
                                                            ? "Tidak dapat dihapus (sedang digunakan)"
                                                            : "Hapus kategori"
                                                    }
                                                >
                                                    <Icon
                                                        icon="ph:trash"
                                                        className="w-4 h-4 mr-1"
                                                    />
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Halaman{" "}
                            <span className="font-medium text-gray-900">
                                {currentPage}
                            </span>{" "}
                            dari{" "}
                            <span className="font-medium text-gray-900">
                                {totalPages}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                disabled={currentPage === 1}
                                className="inline-flex items-center justify-center w-8 h-8 text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Sebelumnya"
                            >
                                <Icon
                                    icon="material-symbols:chevron-left"
                                    className="w-4 h-4"
                                />
                            </button>
                            {getPaginationRange().map((page, index) => (
                                <button
                                    key={index}
                                    onClick={() =>
                                        typeof page === "number"
                                            ? handlePageChange(page)
                                            : undefined
                                    }
                                    disabled={page === "..."}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none ${
                                        page === currentPage
                                            ? "bg-blue-600 text-white shadow-md"
                                            : page === "..."
                                            ? "text-gray-400 cursor-default"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                                disabled={currentPage === totalPages}
                                className="inline-flex items-center justify-center w-8 h-8 text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Selanjutnya"
                            >
                                <Icon
                                    icon="material-symbols:chevron-right"
                                    className="w-4 h-4"
                                />
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {paginatedCategories.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="text-center py-16">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">
                                {searchTerm
                                    ? "Tidak ada kategori ditemukan"
                                    : "Belum ada kategori"}
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                                {searchTerm
                                    ? `Tidak ada kategori yang cocok dengan pencarian "${searchTerm}".`
                                    : "Mulai dengan menambahkan kategori pertama untuk mengorganisir link-link pengguna."}
                            </p>
                            {!searchTerm && (
                                <div className="mt-6">
                                    <button
                                        onClick={handleCreateCategory}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <Icon
                                            icon="ph:plus"
                                            className="w-4 h-4 mr-2"
                                        />
                                        Tambah Kategori Pertama
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingCategory(null);
                }}
                onSave={handleSaveCategory}
                category={editingCategory}
                isLoading={isSubmitting}
            />

            <CategoryDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                category={detailCategory}
            />
        </AdminLayout>
    );
}
