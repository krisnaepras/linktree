"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import Image from "next/image";

type Category = {
    id: string;
    name: string;
    icon: string | null;
    createdAt: string;
    _count: {
        detailLinktrees: number;
    };
};

type CategoryLink = {
    id: string;
    title: string;
    url: string;
    isVisible: boolean;
    createdAt: string;
    linktree: {
        id: string;
        title: string;
        slug: string;
        isActive: boolean;
        user: {
            id: string;
            name: string;
            email: string;
        };
    };
    category: {
        id: string;
        name: string;
        icon?: string;
    };
    clicks: { id: string }[];
};

export default function CategoryDetailPage() {
    const { data: session } = useSession();
    const params = useParams();
    const router = useRouter();
    const [category, setCategory] = useState<Category | null>(null);
    const [categoryLinks, setCategoryLinks] = useState<CategoryLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<
        "overview" | "links" | "analytics"
    >("overview");

    const categoryId = params?.id as string;
    const isSuperAdmin = session?.user?.role === "SUPERADMIN";
    const isAdmin = session?.user?.role === "ADMIN";

    useEffect(() => {
        if (categoryId && (isSuperAdmin || isAdmin)) {
            fetchCategoryDetail();
        }
    }, [categoryId, isSuperAdmin, isAdmin]);

    const fetchCategoryDetail = async () => {
        try {
            setLoading(true);

            // Fetch category basic info
            const categoryResponse = await fetch(
                `/api/admin/categories/${categoryId}`
            );
            if (categoryResponse.ok) {
                const categoryData = await categoryResponse.json();
                setCategory(categoryData);
            }

            // Fetch category's links
            const linksResponse = await fetch(
                `/api/admin/categories/${categoryId}/links`
            );
            if (linksResponse.ok) {
                const linksData = await linksResponse.json();
                setCategoryLinks(linksData.links || []);
            }
        } catch (error) {
            console.error("Error fetching category detail:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Analytics data
    const uniqueUsers = new Set(
        categoryLinks.map((link) => link.linktree.user.id)
    ).size;
    const uniqueLinktrees = new Set(
        categoryLinks.map((link) => link.linktree.id)
    ).size;
    const totalClicks = categoryLinks.reduce(
        (total, link) => total + (link.clicks?.length || 0),
        0
    );
    const recentLinks = categoryLinks.filter(
        (link) =>
            new Date(link.createdAt) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    if (!category) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Kategori Tidak Ditemukan
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Kategori yang Anda cari tidak ditemukan atau tidak
                        memiliki akses.
                    </p>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Kembali
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Detail Kategori
                            </h1>
                            <p className="text-gray-600">
                                Informasi lengkap kategori dan penggunaannya
                            </p>
                        </div>
                    </div>
                </div>

                {/* Category Profile Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start space-x-6">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                            {category.icon ? (
                                category.icon.startsWith("/uploads/") ? (
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
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {category.name}
                                </h2>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    Kategori Aktif
                                </span>
                            </div>
                            <p className="text-gray-600 mb-4">
                                ID:{" "}
                                <span className="font-mono text-sm">
                                    {category.id}
                                </span>
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {categoryLinks.length}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Total Links
                                    </div>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {uniqueUsers}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Users Unik
                                    </div>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {totalClicks}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Total Clicks
                                    </div>
                                </div>
                                <div className="text-center p-3 bg-orange-50 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {recentLinks}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Links Minggu Ini
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {[
                                {
                                    id: "overview",
                                    label: "Overview",
                                    icon: "📊"
                                },
                                {
                                    id: "links",
                                    label: "Semua Links",
                                    icon: "🔗"
                                },
                                {
                                    id: "analytics",
                                    label: "Analytics",
                                    icon: "📈"
                                }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === "overview" && (
                            <div className="space-y-6">
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
                                                <span className="text-sm font-medium text-gray-900 font-mono">
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
                                                    Tipe Icon:
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
                                                    {categoryLinks.length}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Total Clicks:
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {totalClicks}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Dibuat:
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {formatDate(
                                                        category.createdAt
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Popularitas:
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {categoryLinks.length > 10
                                                        ? "Tinggi"
                                                        : categoryLinks.length >
                                                          5
                                                        ? "Sedang"
                                                        : "Rendah"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">
                                        Preview Icon
                                    </h4>
                                    <div className="flex items-center justify-center">
                                        <div className="w-20 h-20 flex items-center justify-center bg-white rounded-lg shadow-sm border">
                                            {category.icon ? (
                                                category.icon.startsWith(
                                                    "/uploads/"
                                                ) ? (
                                                    <Image
                                                        src={category.icon}
                                                        alt={category.name}
                                                        width={50}
                                                        height={50}
                                                        className="object-cover rounded"
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
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "links" && (
                            <div className="space-y-4">
                                {categoryLinks.length > 0 ? (
                                    categoryLinks.map((link) => (
                                        <div
                                            key={link.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg">
                                                    {link.category?.icon ? (
                                                        link.category.icon.startsWith(
                                                            "/uploads/"
                                                        ) ? (
                                                            <Image
                                                                src={
                                                                    link
                                                                        .category
                                                                        .icon
                                                                }
                                                                alt={
                                                                    link
                                                                        .category
                                                                        .name
                                                                }
                                                                width={20}
                                                                height={20}
                                                                className="object-cover rounded"
                                                            />
                                                        ) : (
                                                            <span className="text-lg">
                                                                {
                                                                    link
                                                                        .category
                                                                        .icon
                                                                }
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span className="text-lg text-gray-400">
                                                            🔗
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium text-gray-900">
                                                            {link.title}
                                                        </h4>
                                                        <div className="flex items-center space-x-2">
                                                            <span
                                                                className={`px-2 py-1 text-xs rounded-full ${
                                                                    link.isVisible
                                                                        ? "bg-green-100 text-green-800"
                                                                        : "bg-gray-100 text-gray-800"
                                                                }`}
                                                            >
                                                                {link.isVisible
                                                                    ? "Visible"
                                                                    : "Hidden"}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {link.clicks
                                                                    ?.length ||
                                                                    0}{" "}
                                                                clicks
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:text-blue-800 truncate block"
                                                    >
                                                        {link.url}
                                                    </a>
                                                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                        <span>
                                                            User:{" "}
                                                            {
                                                                link.linktree
                                                                    .user.name
                                                            }
                                                        </span>
                                                        <span>
                                                            Linktree:{" "}
                                                            {
                                                                link.linktree
                                                                    .title
                                                            }
                                                        </span>
                                                        <span>
                                                            Dibuat:{" "}
                                                            {formatDate(
                                                                link.createdAt
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-gray-400 text-4xl mb-4">
                                            🔗
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            Belum Ada Link
                                        </h3>
                                        <p className="text-gray-600">
                                            Kategori ini belum digunakan untuk
                                            membuat link apapun.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "analytics" && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-blue-900 mb-2">
                                            Total Penggunaan
                                        </h4>
                                        <div className="text-3xl font-bold text-blue-600">
                                            {category._count.detailLinktrees}
                                        </div>
                                        <p className="text-sm text-blue-700">
                                            Links dibuat dengan kategori ini
                                        </p>
                                    </div>

                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-green-900 mb-2">
                                            Jangkauan User
                                        </h4>
                                        <div className="text-3xl font-bold text-green-600">
                                            {uniqueUsers}
                                        </div>
                                        <p className="text-sm text-green-700">
                                            User unik yang menggunakan kategori
                                            ini
                                        </p>
                                    </div>

                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-purple-900 mb-2">
                                            Distribusi Linktree
                                        </h4>
                                        <div className="text-3xl font-bold text-purple-600">
                                            {uniqueLinktrees}
                                        </div>
                                        <p className="text-sm text-purple-700">
                                            Linktree yang menggunakan kategori
                                            ini
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-4">
                                        Aktivitas Terbaru
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">
                                                Links dibuat minggu ini:
                                            </p>
                                            <div className="text-2xl font-bold text-gray-900">
                                                {recentLinks}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">
                                                Rata-rata per hari:
                                            </p>
                                            <div className="text-2xl font-bold text-gray-900">
                                                {category._count
                                                    .detailLinktrees > 0
                                                    ? Math.round(
                                                          category._count
                                                              .detailLinktrees /
                                                              Math.max(
                                                                  1,
                                                                  Math.floor(
                                                                      (Date.now() -
                                                                          new Date(
                                                                              category.createdAt
                                                                          ).getTime()) /
                                                                          (1000 *
                                                                              60 *
                                                                              60 *
                                                                              24)
                                                                  )
                                                              )
                                                      )
                                                    : 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {categoryLinks.length > 0 && (
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <h4 className="font-medium text-gray-900 mb-4">
                                            Top Users
                                        </h4>
                                        <div className="space-y-2">
                                            {Object.entries(
                                                categoryLinks.reduce(
                                                    (acc, link) => {
                                                        const userEmail =
                                                            link.linktree.user
                                                                .email;
                                                        const userName =
                                                            link.linktree.user
                                                                .name;
                                                        acc[userEmail] = acc[
                                                            userEmail
                                                        ] || {
                                                            name: userName,
                                                            count: 0
                                                        };
                                                        acc[userEmail].count++;
                                                        return acc;
                                                    },
                                                    {} as Record<
                                                        string,
                                                        {
                                                            name: string;
                                                            count: number;
                                                        }
                                                    >
                                                )
                                            )
                                                .sort(
                                                    ([, a], [, b]) =>
                                                        b.count - a.count
                                                )
                                                .slice(0, 5)
                                                .map(([email, data]) => (
                                                    <div
                                                        key={email}
                                                        className="flex items-center justify-between py-2"
                                                    >
                                                        <div>
                                                            <span className="font-medium text-gray-900">
                                                                {data.name}
                                                            </span>
                                                            <span className="text-sm text-gray-500 ml-2">
                                                                {email}
                                                            </span>
                                                        </div>
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {data.count} links
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
