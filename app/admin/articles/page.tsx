"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import Swal from "sweetalert2";
import Link from "next/link";

type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

type Article = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    status: ArticleStatus;
    isFeatured: boolean;
    viewCount: number;
    readingTime: number | null;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    author: {
        id: string;
        name: string;
        email: string;
    };
    category: {
        id: string;
        name: string;
        slug: string;
        icon: string | null;
        color: string | null;
    } | null;
    _count: {
        views: number;
    };
};

type PaginationData = {
    page: number;
    limit: number;
    total: number;
    pages: number;
};

export default function AdminArticlesPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationData>({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [categoryFilter, setCategoryFilter] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString()
            });

            if (statusFilter && statusFilter !== "ALL") {
                params.append("status", statusFilter);
            }
            if (categoryFilter) {
                params.append("category", categoryFilter);
            }
            if (searchQuery) {
                params.append("search", searchQuery);
            }

            const response = await fetch(`/api/admin/articles?${params}`);

            if (response.ok) {
                const data = await response.json();
                setArticles(data.articles);
                setPagination(data.pagination);
            } else {
                throw new Error("Failed to fetch articles");
            }
        } catch (error) {
            console.error("Error fetching articles:", error);
            Swal.fire({
                title: "Error",
                text: "Gagal memuat artikel",
                icon: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, [pagination.page, statusFilter, categoryFilter, searchQuery]);

    const handleDeleteArticle = async (article: Article) => {
        const result = await Swal.fire({
            title: "Hapus Artikel?",
            text: `Apakah Anda yakin ingin menghapus artikel "${article.title}"?`,
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
                    `/api/admin/articles/${article.id}`,
                    {
                        method: "DELETE"
                    }
                );

                if (response.ok) {
                    await fetchArticles();
                    Swal.fire({
                        title: "Berhasil!",
                        text: "Artikel berhasil dihapus",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    throw new Error("Failed to delete article");
                }
            } catch (error) {
                console.error("Error deleting article:", error);
                Swal.fire({
                    title: "Error",
                    text: "Gagal menghapus artikel",
                    icon: "error"
                });
            }
        }
    };

    const getStatusBadge = (status: ArticleStatus) => {
        switch (status) {
            case "PUBLISHED":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Published
                    </span>
                );
            case "DRAFT":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Draft
                    </span>
                );
            case "ARCHIVED":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Archived
                    </span>
                );
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    if (loading && articles.length === 0) {
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
                                Kelola Artikel
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Buat dan kelola artikel untuk platform LinkUMKM
                            </p>
                        </div>
                        <Link
                            href="/admin/articles/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                            Buat Artikel
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <svg
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Cari artikel..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="ALL">Semua Status</option>
                                <option value="PUBLISHED">Published</option>
                                <option value="DRAFT">Draft</option>
                                <option value="ARCHIVED">Archived</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        <div className="flex items-center">
                            <button
                                onClick={() => {
                                    setStatusFilter("ALL");
                                    setCategoryFilter("");
                                    setSearchQuery("");
                                    setPagination((prev) => ({
                                        ...prev,
                                        page: 1
                                    }));
                                }}
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                                Reset Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-600">
                        Menampilkan {articles.length} dari {pagination.total}{" "}
                        artikel
                    </div>
                </div>

                {/* Articles Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Artikel
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Penulis
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Views
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {articles.map((article) => (
                                    <tr
                                        key={article.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {article.title}
                                                        </div>
                                                        {article.isFeatured && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                                ⭐ Featured
                                                            </span>
                                                        )}
                                                    </div>
                                                    {article.excerpt && (
                                                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                            {article.excerpt}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center space-x-4 mt-2">
                                                        {article.category && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                {
                                                                    article
                                                                        .category
                                                                        .icon
                                                                }{" "}
                                                                {
                                                                    article
                                                                        .category
                                                                        .name
                                                                }
                                                            </span>
                                                        )}
                                                        {article.readingTime && (
                                                            <span className="text-xs text-gray-500">
                                                                {
                                                                    article.readingTime
                                                                }{" "}
                                                                min read
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(article.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {article.author.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {article._count.views}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>
                                                {article.status ===
                                                    "PUBLISHED" &&
                                                article.publishedAt
                                                    ? formatDate(
                                                          article.publishedAt
                                                      )
                                                    : formatDate(
                                                          article.createdAt
                                                      )}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {article.status === "PUBLISHED"
                                                    ? "Published"
                                                    : "Created"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={`/admin/articles/${article.id}`}
                                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    <svg
                                                        className="w-4 h-4 mr-1"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        />
                                                    </svg>
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteArticle(
                                                            article
                                                        )
                                                    }
                                                    className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    <svg
                                                        className="w-4 h-4 mr-1"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
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
                {pagination.pages > 1 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Halaman {pagination.page} dari{" "}
                                {pagination.pages}
                            </div>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() =>
                                        setPagination((prev) => ({
                                            ...prev,
                                            page: prev.page - 1
                                        }))
                                    }
                                    disabled={pagination.page === 1}
                                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                                        pagination.page === 1
                                            ? "text-gray-400 cursor-not-allowed"
                                            : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                                    }`}
                                >
                                    ← Sebelumnya
                                </button>

                                <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md">
                                    {pagination.page}
                                </span>

                                <button
                                    onClick={() =>
                                        setPagination((prev) => ({
                                            ...prev,
                                            page: prev.page + 1
                                        }))
                                    }
                                    disabled={
                                        pagination.page === pagination.pages
                                    }
                                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                                        pagination.page === pagination.pages
                                            ? "text-gray-400 cursor-not-allowed"
                                            : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                                    }`}
                                >
                                    Selanjutnya →
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && articles.length === 0 && (
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
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">
                                {searchQuery || statusFilter !== "ALL"
                                    ? "Tidak ada artikel ditemukan"
                                    : "Belum ada artikel"}
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                                {searchQuery || statusFilter !== "ALL"
                                    ? "Coba ubah filter pencarian Anda."
                                    : "Mulai dengan membuat artikel pertama untuk platform LinkUMKM."}
                            </p>
                            {!searchQuery && statusFilter === "ALL" && (
                                <div className="mt-6">
                                    <Link
                                        href="/admin/articles/create"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <svg
                                            className="w-4 h-4 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                            />
                                        </svg>
                                        Buat Artikel Pertama
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
