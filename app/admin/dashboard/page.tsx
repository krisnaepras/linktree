"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AdminLayout from "@/components/AdminLayout";
import Link from "next/link";

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

type Linktree = {
    id: string;
    title: string;
    slug: string;
    user: {
        name: string;
        email: string;
    };
    _count: {
        views: number;
        detailLinktrees: number;
    };
};

type Article = {
    id: string;
    title: string;
    slug: string;
    viewCount: number;
    author: {
        name: string;
        email: string;
    };
    category?: {
        name: string;
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
        totalArticles: number;
        totalArticleCategories: number;
        totalViews: number;
        totalClicks: number;
        recentUsers: number;
        recentLinktrees: number;
        recentArticles: number;
        userGrowthRate: number;
    };
    popularCategories: Category[];
    topLinktrees: Linktree[];
    topArticles: Article[];
    ratios: {
        linktreesPerUser: number;
        linksPerLinktree: number;
        activeUsersPercentage: number;
        clickThroughRate: number;
        averageClicksPerLink: number;
    };
};

export default function AdminDashboard() {
    const { data: session } = useSession();
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

            const statsResponse = await fetch("/api/admin/dashboard/stats");
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStats(statsData);
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
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-teal-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                            <span className="text-xl font-bold text-white">
                                A
                            </span>
                        </div>
                        <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-slate-600 font-medium">
                            Memuat dashboard...
                        </p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!stats) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-64">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-slate-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <p className="text-slate-600 mb-4 font-medium">
                            Gagal memuat data dashboard
                        </p>
                        <button
                            onClick={fetchDashboardData}
                            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl"
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
                {/* Welcome Header - Simple & Clean */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                Dashboard Admin
                            </h1>
                            <p className="text-slate-600 mt-1">
                                Halo, {session?.user?.name} - Kelola sistem
                                LinkUMKM dengan mudah
                            </p>
                        </div>
                        {/* <div className="w-12 h-12 bg-gradient-to-r from-sky-500 to-teal-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                                {session?.user?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div> */}
                    </div>
                </div>

                {/* Core Metrics - Focus on Most Important Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-slate-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-gradient-to-r from-sky-100 to-sky-200 rounded-xl mr-4">
                                <svg
                                    className="w-6 h-6 text-sky-600"
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
                            <div>
                                <p className="text-sm font-medium text-slate-600">
                                    Total Pengguna
                                </p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {stats.overview.totalUsers}
                                </p>
                                <p className="text-xs text-emerald-600">
                                    +{stats.overview.recentUsers} minggu ini
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-slate-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-xl mr-4">
                                <svg
                                    className="w-6 h-6 text-emerald-600"
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
                            <div>
                                <p className="text-sm font-medium text-slate-600">
                                    Total Linktree
                                </p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {stats.overview.totalLinktrees}
                                </p>
                                <p className="text-xs text-emerald-600">
                                    +{stats.overview.recentLinktrees} minggu ini
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-slate-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-gradient-to-r from-teal-100 to-teal-200 rounded-xl mr-4">
                                <svg
                                    className="w-6 h-6 text-teal-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-600">
                                    Total Views
                                </p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {stats.overview.totalViews.toLocaleString()}
                                </p>
                                <p className="text-xs text-slate-500">
                                    Semua linktree
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-slate-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl mr-4">
                                <svg
                                    className="w-6 h-6 text-slate-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-600">
                                    Total Klik
                                </p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {stats.overview.totalClicks.toLocaleString()}
                                </p>
                                <p className="text-xs text-slate-500">
                                    Semua link
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions - Simplified */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                        Kelola Sistem
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link
                            href="/admin/users"
                            className="group p-4 bg-gradient-to-r from-sky-50 to-sky-100 hover:from-sky-100 hover:to-sky-150 rounded-xl border border-sky-200 transition-all"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-sky-500 rounded-lg group-hover:bg-sky-600 transition-colors">
                                    <svg
                                        className="w-5 h-5 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">
                                        Kelola Pengguna
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {stats.overview.totalUsers} pengguna
                                        terdaftar
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/admin/categories"
                            className="group p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-150 rounded-xl border border-emerald-200 transition-all"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-500 rounded-lg group-hover:bg-emerald-600 transition-colors">
                                    <svg
                                        className="w-5 h-5 text-white"
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
                                <div>
                                    <p className="font-medium text-slate-800">
                                        Kelola Kategori
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {stats.overview.totalCategories}{" "}
                                        kategori tersedia
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/admin/articles"
                            className="group p-4 bg-gradient-to-r from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-150 rounded-xl border border-teal-200 transition-all"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-teal-500 rounded-lg group-hover:bg-teal-600 transition-colors">
                                    <svg
                                        className="w-5 h-5 text-white"
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
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">
                                        Kelola Artikel
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {stats.overview.totalArticles} artikel
                                        tersedia
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Performance Overview - Simplified */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Performers */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-800">
                                Linktree Terpopuler
                            </h3>
                            <span className="text-sm text-slate-500">
                                Berdasarkan views
                            </span>
                        </div>
                        <div className="space-y-3">
                            {stats.topLinktrees
                                .slice(0, 5)
                                .map((linktree, index) => (
                                    <div
                                        key={linktree.id}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-6 h-6 bg-gradient-to-r from-sky-500 to-teal-500 rounded-lg flex items-center justify-center">
                                                <span className="text-white font-bold text-xs">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800 text-sm">
                                                    {linktree.title}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {linktree.user.name}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-semibold text-slate-700 text-sm">
                                            {linktree._count.views.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Categories Usage */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-800">
                                Kategori Populer
                            </h3>
                            <Link
                                href="/admin/categories"
                                className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                            >
                                Kelola →
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {stats.popularCategories
                                .slice(0, 5)
                                .map((category, index) => (
                                    <div
                                        key={category.id}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                                                <span className="text-white font-bold text-xs">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <span className="font-medium text-slate-800 text-sm">
                                                {category.icon} {category.name}
                                            </span>
                                        </div>
                                        <span className="font-semibold text-slate-700 text-sm">
                                            {category._count.detailLinktrees}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                {/* Key Performance Indicators - Simple Grid */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                        Indikator Kinerja
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-emerald-600">
                                {stats.ratios.clickThroughRate}%
                            </div>
                            <div className="text-sm text-slate-600">
                                Click Rate
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-sky-600">
                                {stats.ratios.linktreesPerUser}
                            </div>
                            <div className="text-sm text-slate-600">
                                Linktree per User
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-teal-600">
                                {stats.ratios.linksPerLinktree}
                            </div>
                            <div className="text-sm text-slate-600">
                                Link per Linktree
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-600">
                                {stats.ratios.averageClicksPerLink}
                            </div>
                            <div className="text-sm text-slate-600">
                                Avg Klik per Link
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
