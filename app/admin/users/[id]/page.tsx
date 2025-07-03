"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import Image from "next/image";

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    _count: {
        linktrees: number;
    };
    linktrees?: {
        id: string;
        title: string;
        createdAt: string;
        _count: {
            detailLinktrees: number;
        };
    }[];
};

type Linktree = {
    id: string;
    title: string;
    createdAt: string;
    _count: {
        detailLinktrees: number;
    };
    detailLinktrees: {
        id: string;
        title: string;
        url: string;
        category: {
            name: string;
            icon: string | null;
        };
        createdAt: string;
    }[];
};

export default function UserDetailPage() {
    const { data: session } = useSession();
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [userLinktrees, setUserLinktrees] = useState<Linktree[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<
        "overview" | "linktrees" | "links"
    >("overview");

    const userId = params?.id as string;
    const isSuperAdmin = session?.user?.role === "SUPERADMIN";
    const isAdmin = session?.user?.role === "ADMIN";

    useEffect(() => {
        if (userId && (isSuperAdmin || isAdmin)) {
            fetchUserDetail();
        }
    }, [userId, isSuperAdmin, isAdmin]);

    const fetchUserDetail = async () => {
        try {
            setLoading(true);

            // Fetch user basic info
            const userResponse = await fetch(`/api/admin/users/${userId}`);
            if (userResponse.ok) {
                const userData = await userResponse.json();
                setUser(userData);
            }

            // Fetch user's linktrees with links
            const linktreesResponse = await fetch(
                `/api/admin/users/${userId}/linktrees`
            );
            if (linktreesResponse.ok) {
                const linktreesData = await linktreesResponse.json();
                setUserLinktrees(linktreesData);
            }
        } catch (error) {
            console.error("Error fetching user detail:", error);
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

    const totalLinks = userLinktrees.reduce(
        (sum, linktree) => sum + linktree._count.detailLinktrees,
        0
    );

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    if (!user) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        User Tidak Ditemukan
                    </h2>
                    <p className="text-gray-600 mb-6">
                        User yang Anda cari tidak ditemukan atau tidak memiliki
                        akses.
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
                                Detail User
                            </h1>
                            <p className="text-gray-600">
                                Informasi lengkap pengguna dan aktivitasnya
                            </p>
                        </div>
                    </div>
                </div>

                {/* User Profile Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start space-x-6">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-3xl font-bold text-gray-600">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {user.name}
                                </h2>
                                <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        user.role === "SUPERADMIN"
                                            ? "bg-purple-100 text-purple-800"
                                            : user.role === "ADMIN"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-green-100 text-green-800"
                                    }`}
                                >
                                    {user.role === "SUPERADMIN"
                                        ? "Super Admin"
                                        : user.role === "ADMIN"
                                        ? "Admin"
                                        : "User"}
                                </span>
                            </div>
                            <p className="text-gray-600 mb-4">{user.email}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {user._count.linktrees}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Linktrees
                                    </div>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {totalLinks}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Total Links
                                    </div>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {Math.floor(
                                            (Date.now() -
                                                new Date(
                                                    user.createdAt
                                                ).getTime()) /
                                                (1000 * 60 * 60 * 24)
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Hari Bergabung
                                    </div>
                                </div>
                                <div className="text-center p-3 bg-orange-50 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {user._count.linktrees > 0
                                            ? "Aktif"
                                            : "Pasif"}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Status
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
                                    icon: "👤"
                                },
                                {
                                    id: "linktrees",
                                    label: "Linktrees",
                                    icon: "🌐"
                                },
                                {
                                    id: "links",
                                    label: "Semua Links",
                                    icon: "🔗"
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
                                            Informasi Akun
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    ID User:
                                                </span>
                                                <span className="text-sm font-medium text-gray-900 font-mono">
                                                    {user.id}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Email:
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {user.email}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Role:
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {user.role}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-3">
                                            Waktu & Aktivitas
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Bergabung:
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {formatDate(user.createdAt)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Terakhir Update:
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {formatDate(user.updatedAt)}
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
                            </div>
                        )}

                        {activeTab === "linktrees" && (
                            <div className="space-y-4">
                                {userLinktrees.length > 0 ? (
                                    userLinktrees.map((linktree) => (
                                        <div
                                            key={linktree.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-medium text-gray-900">
                                                    {linktree.title}
                                                </h4>
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {
                                                        linktree._count
                                                            .detailLinktrees
                                                    }{" "}
                                                    links
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">
                                                Dibuat:{" "}
                                                {formatDate(linktree.createdAt)}
                                            </p>

                                            {linktree.detailLinktrees.length >
                                                0 && (
                                                <div className="space-y-2">
                                                    <h5 className="text-sm font-medium text-gray-700">
                                                        Links dalam linktree
                                                        ini:
                                                    </h5>
                                                    <div className="space-y-1">
                                                        {linktree.detailLinktrees
                                                            .slice(0, 3)
                                                            .map((link) => (
                                                                <div
                                                                    key={
                                                                        link.id
                                                                    }
                                                                    className="flex items-center space-x-2 text-sm"
                                                                >
                                                                    <div className="w-4 h-4 flex items-center justify-center">
                                                                        {link
                                                                            .category
                                                                            .icon ? (
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
                                                                                    width={
                                                                                        16
                                                                                    }
                                                                                    height={
                                                                                        16
                                                                                    }
                                                                                    className="object-cover rounded"
                                                                                />
                                                                            ) : (
                                                                                <span className="text-xs">
                                                                                    {
                                                                                        link
                                                                                            .category
                                                                                            .icon
                                                                                    }
                                                                                </span>
                                                                            )
                                                                        ) : (
                                                                            <span className="text-xs">
                                                                                🔗
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-gray-900">
                                                                        {
                                                                            link.title
                                                                        }
                                                                    </span>
                                                                    <span className="text-gray-500">
                                                                        (
                                                                        {
                                                                            link
                                                                                .category
                                                                                .name
                                                                        }
                                                                        )
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        {linktree
                                                            .detailLinktrees
                                                            .length > 3 && (
                                                            <p className="text-xs text-gray-500">
                                                                +
                                                                {linktree
                                                                    .detailLinktrees
                                                                    .length -
                                                                    3}{" "}
                                                                link lainnya
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-gray-400 text-4xl mb-4">
                                            📝
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            Belum Ada Linktree
                                        </h3>
                                        <p className="text-gray-600">
                                            User ini belum membuat linktree
                                            apapun.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "links" && (
                            <div className="space-y-4">
                                {userLinktrees.some(
                                    (lt) => lt.detailLinktrees.length > 0
                                ) ? (
                                    <div className="space-y-4">
                                        {userLinktrees.map((linktree) =>
                                            linktree.detailLinktrees.map(
                                                (link) => (
                                                    <div
                                                        key={link.id}
                                                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="flex items-start space-x-3">
                                                            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg">
                                                                {link.category
                                                                    .icon ? (
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
                                                                            width={
                                                                                20
                                                                            }
                                                                            height={
                                                                                20
                                                                            }
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
                                                                <h4 className="font-medium text-gray-900">
                                                                    {link.title}
                                                                </h4>
                                                                <p className="text-sm text-blue-600 hover:text-blue-800 truncate">
                                                                    {link.url}
                                                                </p>
                                                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                                    <span>
                                                                        Kategori:{" "}
                                                                        {
                                                                            link
                                                                                .category
                                                                                .name
                                                                        }
                                                                    </span>
                                                                    <span>
                                                                        Linktree:{" "}
                                                                        {
                                                                            linktree.title
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
                                                )
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-gray-400 text-4xl mb-4">
                                            🔗
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            Belum Ada Link
                                        </h3>
                                        <p className="text-gray-600">
                                            User ini belum membuat link apapun.
                                        </p>
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
