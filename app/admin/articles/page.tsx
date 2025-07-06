"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import AdminLayout from "@/components/AdminLayout";
import Swal from "sweetalert2";
import Link from "next/link";

type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

type Article = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content?: string;
    featuredImage: string | null;
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
    };
    tags?: {
        id: string;
        name: string;
    }[];
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
    const [categories, setCategories] = useState<
        { id: string; name: string; slug: string }[]
    >([]);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [categoryFilter, setCategoryFilter] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Sorting
    const [sortBy, setSortBy] = useState<
        "title" | "status" | "viewCount" | "createdAt"
    >("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const fetchCategories = async () => {
        try {
            const response = await fetch("/api/admin/article-categories");
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

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
        fetchCategories();
    }, []);

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

    // Sort articles
    const sortedArticles = [...articles].sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortBy) {
            case "title":
                aValue = a.title.toLowerCase();
                bValue = b.title.toLowerCase();
                break;
            case "status":
                aValue = a.status;
                bValue = b.status;
                break;
            case "viewCount":
                aValue = a.viewCount;
                bValue = b.viewCount;
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

    // Handle sort column click
    const handleSort = (
        column: "title" | "status" | "viewCount" | "createdAt"
    ) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
    };

    // Get sort icon
    const getSortIcon = (
        column: "title" | "status" | "viewCount" | "createdAt"
    ) => {
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

    // Pagination functions
    const handlePageChange = (page: number) => {
        setPagination((prev) => ({ ...prev, page }));
    };

    const getPaginationRange = () => {
        const range = [];
        const maxVisible = 5;

        if (pagination.pages <= maxVisible) {
            for (let i = 1; i <= pagination.pages; i++) {
                range.push(i);
            }
        } else {
            const start = Math.max(1, pagination.page - 2);
            const end = Math.min(pagination.pages, start + maxVisible - 1);

            for (let i = start; i <= end; i++) {
                range.push(i);
            }
        }

        return range;
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
                            <Icon icon="ph:plus" className="w-4 h-4 mr-2" />
                            Buat Artikel
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Icon
                                    icon="ph:magnifying-glass"
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                                />
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

                        {/* Category Filter */}
                        <div>
                            <select
                                value={categoryFilter}
                                onChange={(e) =>
                                    setCategoryFilter(e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
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
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Menampilkan {articles.length} dari{" "}
                            {pagination.total} artikel
                        </div>

                        {/* Active Filters */}
                        {(statusFilter !== "ALL" ||
                            categoryFilter !== "" ||
                            searchQuery !== "") && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                    Filter aktif:
                                </span>
                                <div className="flex items-center gap-2">
                                    {statusFilter !== "ALL" && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Status: {statusFilter}
                                            <button
                                                onClick={() =>
                                                    setStatusFilter("ALL")
                                                }
                                                className="ml-1 hover:text-blue-600"
                                            >
                                                <Icon
                                                    icon="ph:x"
                                                    className="w-3 h-3"
                                                />
                                            </button>
                                        </span>
                                    )}
                                    {categoryFilter !== "" && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Kategori:{" "}
                                            {categories.find(
                                                (c) => c.id === categoryFilter
                                            )?.name || "Unknown"}
                                            <button
                                                onClick={() =>
                                                    setCategoryFilter("")
                                                }
                                                className="ml-1 hover:text-green-600"
                                            >
                                                <Icon
                                                    icon="ph:x"
                                                    className="w-3 h-3"
                                                />
                                            </button>
                                        </span>
                                    )}
                                    {searchQuery !== "" && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            Pencarian: "{searchQuery}"
                                            <button
                                                onClick={() =>
                                                    setSearchQuery("")
                                                }
                                                className="ml-1 hover:text-purple-600"
                                            >
                                                <Icon
                                                    icon="ph:x"
                                                    className="w-3 h-3"
                                                />
                                            </button>
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Articles Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleSort("title")}
                                            className="flex items-center gap-2 w-full text-left hover:text-gray-700"
                                        >
                                            Artikel
                                            {getSortIcon("title")}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleSort("status")}
                                            className="flex items-center gap-2 w-full text-left hover:text-gray-700"
                                        >
                                            Status
                                            {getSortIcon("status")}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Penulis & Kategori
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() =>
                                                handleSort("viewCount")
                                            }
                                            className="flex items-center gap-2 w-full text-left hover:text-gray-700"
                                        >
                                            Statistik
                                            {getSortIcon("viewCount")}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() =>
                                                handleSort("createdAt")
                                            }
                                            className="flex items-center gap-2 w-full text-left hover:text-gray-700"
                                        >
                                            Tanggal
                                            {getSortIcon("createdAt")}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedArticles.map((article) => (
                                    <tr
                                        key={article.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-start space-x-3">
                                                {/* Article Image */}
                                                <div className="flex-shrink-0">
                                                    {article.featuredImage ? (
                                                        <img
                                                            src={
                                                                article.featuredImage
                                                            }
                                                            alt={article.title}
                                                            className="w-12 h-12 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                            <Icon
                                                                icon="ph:article"
                                                                className="w-6 h-6 text-white"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Article Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="text-sm font-medium text-gray-900 truncate">
                                                            {article.title}
                                                        </div>
                                                        {article.isFeatured && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                <Icon
                                                                    icon="ph:star-fill"
                                                                    className="w-3 h-3 mr-1"
                                                                />
                                                                Featured
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Article Excerpt */}
                                                    {article.excerpt && (
                                                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                            {article.excerpt}
                                                        </div>
                                                    )}

                                                    {/* Article Meta */}
                                                    <div className="flex items-center space-x-4 mt-2">
                                                        <div className="text-xs text-gray-500">
                                                            /{article.slug}
                                                        </div>
                                                        {article.readingTime && (
                                                            <span className="inline-flex items-center text-xs text-gray-500">
                                                                <Icon
                                                                    icon="ph:clock"
                                                                    className="w-3 h-3 mr-1"
                                                                />
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
                                            <div className="space-y-1">
                                                {getStatusBadge(article.status)}
                                                {article.status ===
                                                    "PUBLISHED" &&
                                                    article.publishedAt && (
                                                        <div className="text-xs text-gray-500">
                                                            Published{" "}
                                                            {new Date(
                                                                article.publishedAt
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

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-2">
                                                {/* Author */}
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                                                        <Icon
                                                            icon="ph:user"
                                                            className="w-4 h-4 text-white"
                                                        />
                                                    </div>
                                                    <div className="ml-2">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {
                                                                article.author
                                                                    .name
                                                            }
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {
                                                                article.author
                                                                    .email
                                                            }
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Category */}
                                                {article.category && (
                                                    <div className="flex items-center">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                            <Icon
                                                                icon="ph:folder-simple"
                                                                className="w-3 h-3 mr-1"
                                                            />
                                                            {
                                                                article.category
                                                                    .name
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-2">
                                                {/* View Count */}
                                                <div className="flex items-center">
                                                    <Icon
                                                        icon="ph:eye"
                                                        className="w-4 h-4 text-gray-400 mr-1"
                                                    />
                                                    <span className="text-sm text-gray-900">
                                                        {article.viewCount.toLocaleString()}{" "}
                                                        views
                                                    </span>
                                                </div>

                                                {/* Performance indicator */}
                                                <div className="flex items-center space-x-2">
                                                    {article.viewCount >
                                                    1000 ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                            <Icon
                                                                icon="ph:trending-up"
                                                                className="w-3 h-3 mr-1"
                                                            />
                                                            Popular
                                                        </span>
                                                    ) : article.viewCount >
                                                      100 ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                            <Icon
                                                                icon="ph:graph"
                                                                className="w-3 h-3 mr-1"
                                                            />
                                                            Good
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                            <Icon
                                                                icon="ph:dot-outline"
                                                                className="w-3 h-3 mr-1"
                                                            />
                                                            New
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="text-sm text-gray-900">
                                                    {article.status ===
                                                        "PUBLISHED" &&
                                                    article.publishedAt
                                                        ? new Date(
                                                              article.publishedAt
                                                          ).toLocaleDateString(
                                                              "id-ID",
                                                              {
                                                                  day: "2-digit",
                                                                  month: "short",
                                                                  year: "numeric"
                                                              }
                                                          )
                                                        : new Date(
                                                              article.createdAt
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
                                                    {article.status ===
                                                        "PUBLISHED" &&
                                                    article.publishedAt
                                                        ? new Date(
                                                              article.publishedAt
                                                          ).toLocaleTimeString(
                                                              "id-ID",
                                                              {
                                                                  hour: "2-digit",
                                                                  minute: "2-digit"
                                                              }
                                                          )
                                                        : new Date(
                                                              article.createdAt
                                                          ).toLocaleTimeString(
                                                              "id-ID",
                                                              {
                                                                  hour: "2-digit",
                                                                  minute: "2-digit"
                                                              }
                                                          )}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {article.status ===
                                                    "PUBLISHED"
                                                        ? "Published"
                                                        : "Created"}
                                                </div>

                                                {/* Updated indicator */}
                                                {article.updatedAt !==
                                                    article.createdAt && (
                                                    <div className="text-xs text-gray-400">
                                                        Updated:{" "}
                                                        {new Date(
                                                            article.updatedAt
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
                                            <div className="flex items-center justify-end space-x-2">
                                                {/* Quick View Link */}
                                                {article.status ===
                                                    "PUBLISHED" && (
                                                    <Link
                                                        href={`/articles/${article.slug}`}
                                                        target="_blank"
                                                        className="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-gray-900"
                                                        title="Lihat artikel"
                                                    >
                                                        <Icon
                                                            icon="ph:eye"
                                                            className="w-4 h-4"
                                                        />
                                                    </Link>
                                                )}

                                                {/* Edit Button */}
                                                <Link
                                                    href={`/admin/articles/${article.id}`}
                                                    className="inline-flex items-center px-3 py-1.5 border border-blue-300 shadow-sm text-xs font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    <Icon
                                                        icon="ph:pencil"
                                                        className="w-4 h-4 mr-1"
                                                    />
                                                    Edit
                                                </Link>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() =>
                                                        handleDeleteArticle(
                                                            article
                                                        )
                                                    }
                                                    className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
                {pagination.pages > 1 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Halaman{" "}
                            <span className="font-medium text-gray-900">
                                {pagination.page}
                            </span>{" "}
                            dari{" "}
                            <span className="font-medium text-gray-900">
                                {pagination.pages}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    handlePageChange(pagination.page - 1)
                                }
                                disabled={pagination.page === 1}
                                className="inline-flex items-center justify-center w-8 h-8 text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Sebelumnya"
                            >
                                <Icon
                                    icon="ph:caret-left"
                                    className="w-4 h-4"
                                />
                            </button>
                            {getPaginationRange().map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none ${
                                        page === pagination.page
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() =>
                                    handlePageChange(pagination.page + 1)
                                }
                                disabled={pagination.page === pagination.pages}
                                className="inline-flex items-center justify-center w-8 h-8 text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Selanjutnya"
                            >
                                <Icon
                                    icon="ph:caret-right"
                                    className="w-4 h-4"
                                />
                            </button>
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
