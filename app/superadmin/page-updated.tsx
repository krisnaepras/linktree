"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AdminLayout from "@/components/AdminLayout";
import { Icon } from "@iconify/react";

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    _count: {
        linktrees: number;
    };
};

type Category = {
    id: string;
    name: string;
    icon: string | null;
    _count: {
        detailLinktrees: number;
    };
};

type DashboardStats = {
    overview: {
        totalUsers: number;
        totalRegularUsers: number;
        totalAdmins: number;
        totalSuperAdmins: number;
        totalCategories: number;
        totalLinktrees: number;
        totalLinks: number;
        recentUsers: number;
        recentLinktrees: number;
        userGrowthRate: number;
    };
    popularCategories: Category[];
    ratios: {
        linktreesPerUser: number;
        linksPerLinktree: number;
        activeUsersPercentage: number;
    };
};

export default function SuperAdminDashboard() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch dashboard statistics
            const [statsResponse, usersResponse, categoriesResponse] =
                await Promise.all([
                    fetch("/api/admin/dashboard/stats"),
                    fetch("/api/admin/users"),
                    fetch("/api/admin/categories")
                ]);

            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStats(statsData);
            }

            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                setUsers(usersData);
            }

            if (categoriesResponse.ok) {
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
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

    if (!stats) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-64">
                    <div className="text-center">
                        <p className="text-gray-500">
                            Gagal memuat data dashboard
                        </p>
                        <button
                            onClick={fetchDashboardData}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header - Enhanced */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">
                                Super Admin Dashboard
                            </h1>
                            <p className="mt-2 text-blue-100">
                                Selamat datang, {session?.user?.name} - Kelola
                                semua sistem dengan kontrol penuh
                            </p>
                            <div className="mt-4 flex items-center space-x-6 text-sm">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                    <span>Sistem Aktif</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                                    <span>Database Terhubung</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                                    <span>Auto-Backup Aktif</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">
                                {new Date().toLocaleDateString("id-ID", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                })}
                            </div>
                            <div className="text-blue-200 text-sm mt-1">
                                {new Date().toLocaleTimeString("id-ID")}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Users - Enhanced */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                    Total Users
                                </p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {stats.overview.totalUsers.toLocaleString()}
                                </p>
                                <div className="flex items-center mt-2">
                                    <span className="text-sm text-green-600 font-medium">
                                        +{stats.overview.recentUsers} minggu ini
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                <Icon
                                    icon="ph:users"
                                    className="w-8 h-8 text-white"
                                />
                            </div>
                        </div>
                        {stats.overview.userGrowthRate !== 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center">
                                    <div
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            stats.overview.userGrowthRate > 0
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {stats.overview.userGrowthRate > 0
                                            ? "↗"
                                            : "↘"}
                                        {Math.abs(
                                            stats.overview.userGrowthRate
                                        )}
                                        %
                                    </div>
                                    <span className="text-sm text-gray-500 ml-2">
                                        vs minggu lalu
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Total Categories - Enhanced */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                    Total Kategori
                                </p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {stats.overview.totalCategories}
                                </p>
                                <div className="flex items-center mt-2">
                                    <span className="text-sm text-gray-600 font-medium">
                                        Sistem kategori
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                                <Icon
                                    icon="ph:folder"
                                    className="w-8 h-8 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Total Linktrees - Enhanced */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                    Total Linktrees
                                </p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {stats.overview.totalLinktrees.toLocaleString()}
                                </p>
                                <div className="flex items-center mt-2">
                                    <span className="text-sm text-purple-600 font-medium">
                                        +{stats.overview.recentLinktrees} minggu
                                        ini
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                                <Icon
                                    icon="ph:link"
                                    className="w-8 h-8 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Total Links - Enhanced */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                    Total Links
                                </p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {stats.overview.totalLinks.toLocaleString()}
                                </p>
                                <div className="flex items-center mt-2">
                                    <span className="text-sm text-orange-600 font-medium">
                                        Semua link aktif
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                                <Icon
                                    icon="ph:article"
                                    className="w-8 h-8 text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Role Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Distribusi Pengguna
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                    <span className="text-sm text-gray-600">
                                        Regular Users
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {stats.overview.totalRegularUsers}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                    <span className="text-sm text-gray-600">
                                        Admins
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {stats.overview.totalAdmins}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                                    <span className="text-sm text-gray-600">
                                        Super Admins
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {stats.overview.totalSuperAdmins}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Statistik Aktivitas
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    Linktrees per User
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                    {stats.ratios.linktreesPerUser}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    Links per Linktree
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                    {stats.ratios.linksPerLinktree}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    Users Aktif
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                    {stats.ratios.activeUsersPercentage}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Aksi Cepat SuperAdmin
                        </h3>
                        <div className="space-y-3">
                            <a
                                href="/superadmin/users"
                                className="flex items-center p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                <Icon
                                    icon="ph:users"
                                    className="w-5 h-5 mr-3"
                                />
                                <span className="text-sm font-medium">
                                    Kelola Pengguna
                                </span>
                            </a>
                            <a
                                href="/superadmin/categories"
                                className="flex items-center p-3 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                                <Icon
                                    icon="ph:folder"
                                    className="w-5 h-5 mr-3"
                                />
                                <span className="text-sm font-medium">
                                    Kelola Kategori
                                </span>
                            </a>
                            <a
                                href="/superadmin/articles"
                                className="flex items-center p-3 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            >
                                <Icon
                                    icon="ph:article"
                                    className="w-5 h-5 mr-3"
                                />
                                <span className="text-sm font-medium">
                                    Kelola Artikel
                                </span>
                            </a>
                            <a
                                href="/superadmin/system-cleanup"
                                className="flex items-center p-3 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            >
                                <Icon
                                    icon="material-symbols:cleaning-services-outline"
                                    className="w-5 h-5 mr-3"
                                />
                                <span className="text-sm font-medium">
                                    System Cleanup
                                </span>
                            </a>
                            <button
                                onClick={fetchDashboardData}
                                className="flex items-center p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
                            >
                                <Icon
                                    icon="ph:arrow-clockwise"
                                    className="w-5 h-5 mr-3"
                                />
                                <span className="text-sm font-medium">
                                    Refresh Data
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Users */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Pengguna Terbaru
                            </h3>
                            <a
                                href="/superadmin/users"
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Lihat Semua
                            </a>
                        </div>

                        <div className="space-y-4">
                            {users.slice(0, 5).map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-sm font-medium text-white">
                                                {user.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {user._count.linktrees}{" "}
                                                linktree(s)
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                            ))}
                        </div>
                    </div>

                    {/* Popular Categories */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Kategori Populer
                            </h3>
                            <a
                                href="/superadmin/categories"
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Lihat Semua
                            </a>
                        </div>

                        <div className="space-y-4">
                            {stats.popularCategories.map((category, index) => (
                                <div
                                    key={category.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 flex items-center justify-center mr-3">
                                            <span className="text-xs font-bold text-gray-500">
                                                #{index + 1}
                                            </span>
                                        </div>
                                        <div className="w-10 h-10 flex items-center justify-center">
                                            {category.icon ? (
                                                category.icon.startsWith(
                                                    "/uploads/"
                                                ) ? (
                                                    <img
                                                        src={category.icon}
                                                        alt={category.name}
                                                        className="w-8 h-8 object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <span className="text-lg">
                                                        {category.icon}
                                                    </span>
                                                )
                                            ) : (
                                                <Icon
                                                    icon="ph:folder"
                                                    className="w-6 h-6 text-gray-400"
                                                />
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <h4 className="font-medium text-gray-900 text-sm">
                                                {category.name}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                {
                                                    category._count
                                                        .detailLinktrees
                                                }{" "}
                                                link
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
