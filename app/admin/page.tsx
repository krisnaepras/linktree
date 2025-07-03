"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AdminLayout from "@/components/AdminLayout";

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

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    const isAdmin = session?.user?.role === "ADMIN";
    const isSuperAdmin = session?.user?.role === "SUPERADMIN";

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
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isSuperAdmin
                            ? "Super Admin Dashboard"
                            : "Admin Dashboard"}
                    </h1>
                    <p className="text-gray-600">
                        {isSuperAdmin
                            ? "Kelola semua pengguna, admin, dan sistem"
                            : "Kelola pengguna dan kategori"}
                    </p>
                </div>

                {/* Main Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Users */}
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Users
                                </p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats.overview.totalUsers}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    +{stats.overview.recentUsers} minggu ini
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <svg
                                    className="w-6 h-6 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                                    />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                                </svg>
                            </div>
                        </div>
                        {stats.overview.userGrowthRate !== 0 && (
                            <div className="mt-4 flex items-center">
                                <span
                                    className={`text-sm ${
                                        stats.overview.userGrowthRate > 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    {stats.overview.userGrowthRate > 0
                                        ? "+"
                                        : ""}
                                    {stats.overview.userGrowthRate}%
                                </span>
                                <span className="text-sm text-gray-500 ml-2">
                                    dari minggu lalu
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Total Categories */}
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Kategori
                                </p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats.overview.totalCategories}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Kategori aktif
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <svg
                                    className="w-6 h-6 text-green-600"
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
                            </div>
                        </div>
                    </div>

                    {/* Total Linktrees */}
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Linktrees
                                </p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats.overview.totalLinktrees}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    +{stats.overview.recentLinktrees} minggu ini
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <svg
                                    className="w-6 h-6 text-purple-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Total Links */}
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Links
                                </p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats.overview.totalLinks}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Semua link aktif
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-full">
                                <svg
                                    className="w-6 h-6 text-orange-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* User Types */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Distribusi Pengguna
                        </h3>
                        <div className="space-y-3">
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

                    {/* Activity Ratios */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Aktivitas Pengguna
                        </h3>
                        <div className="space-y-3">
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

                    {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Aksi Cepat
                        </h3>
                        <div className="space-y-2">
                            <a
                                href={
                                    isSuperAdmin
                                        ? "/superadmin/users"
                                        : "/admin/users"
                                }
                                className="block w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                📋 Kelola Pengguna
                            </a>
                            <a
                                href={
                                    isSuperAdmin
                                        ? "/superadmin/categories"
                                        : "/admin/categories"
                                }
                                className="block w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                                🏷️ Kelola Kategori
                            </a>
                            <button
                                onClick={fetchDashboardData}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                🔄 Refresh Data
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Users */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {isAdmin
                                    ? "Pengguna Terbaru"
                                    : "Pengguna & Admin Terbaru"}
                            </h3>
                            <a
                                href={
                                    isSuperAdmin
                                        ? "/superadmin/users"
                                        : "/admin/users"
                                }
                                className="text-sm text-blue-600 hover:text-blue-700"
                            >
                                Lihat Semua
                            </a>
                        </div>

                        <div className="space-y-3">
                            {users.slice(0, 5).map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-sm font-medium text-gray-600">
                                                {user.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {user.name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
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
                                        <p className="text-xs text-gray-500 mt-1">
                                            {user._count.linktrees} linktree(s)
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Popular Categories */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Kategori Populer
                            </h3>
                            <a
                                href={
                                    isSuperAdmin
                                        ? "/superadmin/categories"
                                        : "/admin/categories"
                                }
                                className="text-sm text-blue-600 hover:text-blue-700"
                            >
                                Lihat Semua
                            </a>
                        </div>

                        <div className="space-y-3">
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
                                                    <span className="text-2xl">
                                                        {category.icon}
                                                    </span>
                                                )
                                            ) : (
                                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <span className="text-gray-400 text-lg">
                                                        📄
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <p className="font-medium text-gray-900">
                                                {category.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            {category._count.detailLinktrees}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            links
                                        </p>
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
