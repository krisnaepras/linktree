"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Icon } from "@iconify/react";
import AdminLayout from "@/components/AdminLayout";
import Swal from "sweetalert2";

const categorySchema = z.object({
    name: z
        .string()
        .min(1, "Nama kategori harus diisi")
        .max(50, "Nama kategori maksimal 50 karakter"),
    description: z
        .string()
        .max(200, "Deskripsi maksimal 200 karakter")
        .optional()
});

type CategoryFormData = z.infer<typeof categorySchema>;

type ArticleCategory = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    _count: {
        articles: number;
    };
    articles?: {
        id: string;
        title: string;
        status: string;
        viewCount: number;
        publishedAt: string | null;
    }[];
};

export default function ArticleCategoriesPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [categories, setCategories] = useState<ArticleCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] =
        useState<ArticleCategory | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sortBy, setSortBy] = useState<"name" | "articles" | "createdAt">(
        "name"
    );
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [itemsPerPage] = useState(10); // Default items per page
    const [currentPage, setCurrentPage] = useState(1);

    // Detail modal state
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailCategory, setDetailCategory] =
        useState<ArticleCategory | null>(null);
    const [detailArticles, setDetailArticles] = useState<any[]>([]);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema)
    });

    // Fetch categories
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/article-categories");
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            } else {
                throw new Error("Failed to fetch categories");
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            Swal.fire({
                title: "Error",
                text: "Gagal mengambil data kategori",
                icon: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Handle create/edit category
    const onSubmit = async (data: CategoryFormData) => {
        setIsSubmitting(true);

        try {
            const method = editingCategory ? "PUT" : "POST";
            const url = editingCategory
                ? `/api/admin/article-categories/${editingCategory.id}`
                : "/api/admin/article-categories";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                await Swal.fire({
                    title: "Berhasil",
                    text: editingCategory
                        ? "Kategori berhasil diperbarui"
                        : "Kategori berhasil dibuat",
                    icon: "success"
                });

                setShowModal(false);
                setEditingCategory(null);
                reset();
                fetchCategories();
            } else {
                const error = await response.json();
                throw new Error(error.error || "Gagal menyimpan kategori");
            }
        } catch (error: any) {
            console.error("Error saving category:", error);
            Swal.fire({
                title: "Error",
                text: error.message || "Gagal menyimpan kategori",
                icon: "error"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete category
    const handleDelete = async (category: ArticleCategory) => {
        if (category._count.articles > 0) {
            Swal.fire({
                title: "Tidak dapat menghapus",
                text: `Kategori "${category.name}" masih memiliki ${category._count.articles} artikel. Hapus artikel terlebih dahulu.`,
                icon: "warning"
            });
            return;
        }

        const result = await Swal.fire({
            title: "Hapus Kategori",
            text: `Apakah Anda yakin ingin menghapus kategori "${category.name}"?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            confirmButtonColor: "#EF4444"
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(
                    `/api/admin/article-categories/${category.id}`,
                    {
                        method: "DELETE"
                    }
                );

                if (response.ok) {
                    await Swal.fire({
                        title: "Berhasil",
                        text: "Kategori berhasil dihapus",
                        icon: "success"
                    });
                    fetchCategories();
                } else {
                    const error = await response.json();
                    throw new Error(error.error || "Gagal menghapus kategori");
                }
            } catch (error: any) {
                console.error("Error deleting category:", error);
                Swal.fire({
                    title: "Error",
                    text: error.message || "Gagal menghapus kategori",
                    icon: "error"
                });
            }
        }
    };

    // Handle edit category
    const handleEdit = (category: ArticleCategory) => {
        setEditingCategory(category);
        reset({
            name: category.name,
            description: category.description || ""
        });
        setShowModal(true);
    };

    // Handle create new category
    const handleCreate = () => {
        setEditingCategory(null);
        reset({
            name: "",
            description: ""
        });
        setShowModal(true);
    };

    // Handle detail category
    const handleDetail = async (category: ArticleCategory) => {
        setDetailCategory(category);
        setShowDetailModal(true);
        setLoadingDetail(true);

        try {
            const response = await fetch(
                `/api/admin/article-categories/${category.id}/articles`
            );
            if (response.ok) {
                const data = await response.json();
                setDetailArticles(data);
            } else {
                throw new Error("Failed to fetch articles");
            }
        } catch (error) {
            console.error("Error fetching articles:", error);
            Swal.fire({
                title: "Error",
                text: "Gagal mengambil data artikel",
                icon: "error"
            });
        } finally {
            setLoadingDetail(false);
        }
    };

    // Handle sort column click
    const handleSort = (column: "name" | "articles" | "createdAt") => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
    };

    // Get sort icon
    const getSortIcon = (column: "name" | "articles" | "createdAt") => {
        if (sortBy !== column) {
            return (
                <Icon
                    icon="ph:arrows-up-down"
                    className="w-4 h-4 text-gray-400"
                />
            );
        }
        return sortOrder === "asc" ? (
            <Icon icon="ph:caret-up" className="w-4 h-4 text-blue-600" />
        ) : (
            <Icon icon="ph:caret-down" className="w-4 h-4 text-blue-600" />
        );
    };

    // Sort categories
    const sortedCategories = [...categories].sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortBy) {
            case "name":
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
            case "articles":
                aValue = a._count.articles;
                bValue = b._count.articles;
                break;
            case "createdAt":
                aValue = new Date(a.createdAt).getTime();
                bValue = new Date(b.createdAt).getTime();
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

    // Pagination calculations
    const totalCategories = sortedCategories.length;
    const totalPages = Math.ceil(totalCategories / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCategories = sortedCategories.slice(startIndex, endIndex);

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Pagination range function
    const getPaginationRange = () => {
        const range = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            // Show all pages if total pages are less than max visible
            for (let i = 1; i <= totalPages; i++) {
                range.push(i);
            }
        } else {
            // Show limited pages with current page in center
            const start = Math.max(1, currentPage - 2);
            const end = Math.min(totalPages, start + maxVisible - 1);

            for (let i = start; i <= end; i++) {
                range.push(i);
            }
        }

        return range;
    };

    // Reset page when sorting changes
    useEffect(() => {
        setCurrentPage(1);
    }, [sortBy, sortOrder]);

    if (!session?.user) {
        router.push("/auth/signin");
        return null;
    }

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Kelola Kategori Artikel
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Kelola kategori untuk mengorganisir artikel
                        </p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm hover:shadow-md"
                    >
                        + Tambah Kategori
                    </button>
                </div>

                {/* Categories List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">
                                Memuat kategori...
                            </p>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <span className="text-gray-500 font-semibold">
                                    📁
                                </span>
                            </div>
                            <p className="text-gray-600">
                                Belum ada kategori artikel
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <button
                                                onClick={() =>
                                                    handleSort("name")
                                                }
                                                className="flex items-center gap-2 w-full text-left"
                                            >
                                                Kategori
                                                {getSortIcon("name")}
                                            </button>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <button
                                                onClick={() =>
                                                    handleSort("articles")
                                                }
                                                className="flex items-center gap-2 w-full text-left"
                                            >
                                                Artikel
                                                {getSortIcon("articles")}
                                            </button>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status & Aktivitas
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <button
                                                onClick={() =>
                                                    handleSort("createdAt")
                                                }
                                                className="flex items-center gap-2 w-full text-left"
                                            >
                                                Dibuat
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
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                        <Icon
                                                            icon="ph:folder-simple"
                                                            className="w-5 h-5 text-white"
                                                        />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {category.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            /{category.slug}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-2">
                                                    <div className="flex items-center">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            <Icon
                                                                icon="ph:article"
                                                                className="w-3 h-3 mr-1"
                                                            />
                                                            {
                                                                category._count
                                                                    .articles
                                                            }{" "}
                                                            artikel
                                                        </span>
                                                    </div>
                                                    {category.articles &&
                                                        category.articles
                                                            .length > 0 && (
                                                            <div className="text-xs text-gray-500">
                                                                Artikel terbaru:{" "}
                                                                {category.articles[0].title.substring(
                                                                    0,
                                                                    30
                                                                )}
                                                                ...
                                                            </div>
                                                        )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        {category._count
                                                            .articles > 0 ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                                <Icon
                                                                    icon="ph:check-circle"
                                                                    className="w-3 h-3 mr-1"
                                                                />
                                                                Aktif
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                                <Icon
                                                                    icon="ph:circle-dashed"
                                                                    className="w-3 h-3 mr-1"
                                                                />
                                                                Kosong
                                                            </span>
                                                        )}
                                                    </div>
                                                    {category.articles &&
                                                        category.articles
                                                            .length > 0 && (
                                                            <div className="text-xs text-gray-500">
                                                                {
                                                                    category.articles.filter(
                                                                        (a) =>
                                                                            a.status ===
                                                                            "PUBLISHED"
                                                                    ).length
                                                                }{" "}
                                                                published
                                                                {category.articles.filter(
                                                                    (a) =>
                                                                        a.status ===
                                                                        "DRAFT"
                                                                ).length >
                                                                    0 && (
                                                                    <span className="ml-1">
                                                                        •{" "}
                                                                        {
                                                                            category.articles.filter(
                                                                                (
                                                                                    a
                                                                                ) =>
                                                                                    a.status ===
                                                                                    "DRAFT"
                                                                            )
                                                                                .length
                                                                        }{" "}
                                                                        draft
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="text-sm text-gray-900">
                                                        {new Date(
                                                            category.createdAt
                                                        ).toLocaleDateString(
                                                            "id-ID",
                                                            {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric"
                                                            }
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(
                                                            category.createdAt
                                                        ).toLocaleTimeString(
                                                            "id-ID",
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            }
                                                        )}
                                                    </div>
                                                    {category.updatedAt !==
                                                        category.createdAt && (
                                                        <div className="text-xs text-gray-400">
                                                            Diperbarui:{" "}
                                                            {new Date(
                                                                category.updatedAt
                                                            ).toLocaleDateString(
                                                                "id-ID",
                                                                {
                                                                    day: "2-digit",
                                                                    month: "short"
                                                                }
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center gap-2 justify-end">
                                                    {/* Detail Button */}
                                                    <button
                                                        onClick={() =>
                                                            handleDetail(
                                                                category
                                                            )
                                                        }
                                                        className="inline-flex items-center px-3 py-1.5 border border-emerald-300 shadow-sm text-xs font-medium rounded-md text-emerald-700 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                                        title="Lihat artikel dalam kategori"
                                                    >
                                                        <Icon
                                                            icon="ph:eye"
                                                            className="w-4 h-4 mr-1"
                                                        />
                                                        Detail
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleEdit(category)
                                                        }
                                                        className="inline-flex items-center px-3 py-1.5 border border-blue-300 shadow-sm text-xs font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                                                            handleDelete(
                                                                category
                                                            )
                                                        }
                                                        className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                        title="Hapus kategori"
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
                    )}
                </div>

                {/* Show total count when no pagination needed */}
                {totalPages <= 1 && totalCategories > 0 && (
                    <div className="mt-4 text-center">
                        <div className="text-sm text-gray-500">
                            Total{" "}
                            <span className="font-medium text-gray-900">
                                {totalCategories}
                            </span>{" "}
                            kategori
                        </div>
                    </div>
                )}

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
                            </button>{" "}
                            {getPaginationRange().map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none ${
                                        page === currentPage
                                            ? "bg-blue-600 text-white shadow-md"
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

                {/* Enhanced Modal for Create/Edit Category */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden transform animate-in zoom-in-95 duration-200">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                {/* Enhanced Header */}
                                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {editingCategory
                                                    ? "Edit Kategori Artikel"
                                                    : "Tambah Kategori Artikel"}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {editingCategory
                                                    ? "Perbarui informasi kategori artikel"
                                                    : "Buat kategori artikel baru untuk mengorganisir konten"}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-all duration-200"
                                            title="Tutup"
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Enhanced Form Content */}
                                <div className="p-6 space-y-6">
                                    {/* Name Field with Enhanced Design */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-800">
                                            Nama Kategori
                                            <span className="text-red-500 ml-1">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            {...register("name")}
                                            className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl font-medium text-gray-900 placeholder-gray-400 transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none ${
                                                errors.name
                                                    ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                            placeholder="Contoh: Teknologi, Bisnis, Edukasi"
                                        />
                                        {errors.name && (
                                            <div className="flex items-center gap-2 mt-2 text-red-600">
                                                <svg
                                                    className="w-4 h-4 flex-shrink-0"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <span className="text-sm font-medium">
                                                    {errors.name.message}
                                                </span>
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Maksimal 50 karakter. Gunakan nama
                                            yang jelas dan mudah dipahami.
                                        </p>
                                    </div>

                                    {/* Description Field with Enhanced Design */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-800">
                                            Deskripsi
                                            <span className="text-gray-400 text-xs ml-1">
                                                (Opsional)
                                            </span>
                                        </label>
                                        <textarea
                                            {...register("description")}
                                            rows={4}
                                            className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl font-medium text-gray-900 placeholder-gray-400 transition-all duration-200 resize-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none ${
                                                errors.description
                                                    ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                            placeholder="Jelaskan kategori ini untuk membantu penulis memilih kategori yang tepat untuk artikel mereka..."
                                        />
                                        {errors.description && (
                                            <div className="flex items-center gap-2 mt-2 text-red-600">
                                                <svg
                                                    className="w-4 h-4 flex-shrink-0"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <span className="text-sm font-medium">
                                                    {errors.description.message}
                                                </span>
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Maksimal 200 karakter. Deskripsi
                                            akan membantu dalam mengorganisir
                                            artikel.
                                        </p>
                                    </div>
                                </div>

                                {/* Enhanced Footer */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-200"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 border-2 border-transparent rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting && (
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                        )}
                                        {isSubmitting
                                            ? "Menyimpan..."
                                            : editingCategory
                                            ? "Perbarui Kategori"
                                            : "Buat Kategori"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Detail Modal - Show Articles in Category */}
                {showDetailModal && detailCategory && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform animate-in zoom-in-95 duration-200">
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            Artikel dalam Kategori:{" "}
                                            {detailCategory.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {detailCategory.description ||
                                                "Daftar artikel yang termasuk dalam kategori ini"}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowDetailModal(false)
                                        }
                                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-all duration-200"
                                        title="Tutup"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                                {loadingDetail ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                                        <p className="ml-4 text-gray-600">
                                            Memuat artikel...
                                        </p>
                                    </div>
                                ) : detailArticles.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                            <Icon
                                                icon="ph:article"
                                                className="w-8 h-8 text-gray-400"
                                            />
                                        </div>
                                        <p className="text-gray-500 text-lg">
                                            Belum ada artikel dalam kategori ini
                                        </p>
                                        <p className="text-gray-400 text-sm mt-2">
                                            Artikel akan muncul di sini ketika
                                            sudah ditambahkan ke kategori ini
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {detailArticles.map((article) => (
                                            <div
                                                key={article.id}
                                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 mb-2">
                                                            {article.title}
                                                        </h4>
                                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                    article.status ===
                                                                    "PUBLISHED"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : "bg-yellow-100 text-yellow-800"
                                                                }`}
                                                            >
                                                                <Icon
                                                                    icon={
                                                                        article.status ===
                                                                        "PUBLISHED"
                                                                            ? "ph:check-circle"
                                                                            : "ph:clock"
                                                                    }
                                                                    className="w-3 h-3 mr-1"
                                                                />
                                                                {article.status ===
                                                                "PUBLISHED"
                                                                    ? "Dipublikasi"
                                                                    : "Draft"}
                                                            </span>
                                                            <span className="flex items-center">
                                                                <Icon
                                                                    icon="ph:eye"
                                                                    className="w-3 h-3 mr-1"
                                                                />
                                                                {article.viewCount ||
                                                                    0}{" "}
                                                                views
                                                            </span>
                                                            {article.publishedAt && (
                                                                <span className="flex items-center">
                                                                    <Icon
                                                                        icon="ph:calendar"
                                                                        className="w-3 h-3 mr-1"
                                                                    />
                                                                    {new Date(
                                                                        article.publishedAt
                                                                    ).toLocaleDateString(
                                                                        "id-ID",
                                                                        {
                                                                            day: "2-digit",
                                                                            month: "short",
                                                                            year: "numeric"
                                                                        }
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {article.excerpt && (
                                                            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                                                                {
                                                                    article.excerpt
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 ml-4">
                                                        <button
                                                            onClick={() =>
                                                                window.open(
                                                                    `/articles/${article.slug}`,
                                                                    "_blank"
                                                                )
                                                            }
                                                            className="inline-flex items-center px-3 py-1.5 border border-blue-300 shadow-sm text-xs font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                                                            title="Lihat artikel"
                                                        >
                                                            <Icon
                                                                icon="ph:eye"
                                                                className="w-4 h-4 mr-1"
                                                            />
                                                            Lihat
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                window.open(
                                                                    `/admin/articles/${article.id}`,
                                                                    "_blank"
                                                                )
                                                            }
                                                            className="inline-flex items-center px-3 py-1.5 border border-emerald-300 shadow-sm text-xs font-medium rounded-md text-emerald-700 bg-white hover:bg-emerald-50"
                                                            title="Edit artikel"
                                                        >
                                                            <Icon
                                                                icon="ph:pencil"
                                                                className="w-4 h-4 mr-1"
                                                            />
                                                            Edit
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                    Total {detailArticles.length} artikel dalam
                                    kategori ini
                                </div>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
