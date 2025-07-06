"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AdminLayout from "@/components/AdminLayout";
import Link from "next/link";
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

                {/* Core Metrics - Compact & Simple */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-4 border border-slate-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-gradient-to-r from-sky-100 to-sky-200 rounded-lg mr-3">
                                <Icon
                                    icon="ph:users"
                                    className="w-5 h-5 text-sky-600"
                                />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-600">
                                    Total Pengguna
                                </p>
                                <p className="text-xl font-bold text-slate-800">
                                    {stats.overview.totalUsers}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-4 border border-slate-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-lg mr-3">
                                <Icon
                                    icon="ph:link"
                                    className="w-5 h-5 text-emerald-600"
                                />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-600">
                                    Total Linktree
                                </p>
                                <p className="text-xl font-bold text-slate-800">
                                    {stats.overview.totalLinktrees}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-4 border border-slate-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-gradient-to-r from-teal-100 to-teal-200 rounded-lg mr-3">
                                <Icon
                                    icon="ph:eye"
                                    className="w-5 h-5 text-teal-600"
                                />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-600">
                                    Total Views
                                </p>
                                <p className="text-xl font-bold text-slate-800">
                                    {stats.overview.totalViews.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-4 border border-slate-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg mr-3">
                                <Icon
                                    icon="ph:cursor"
                                    className="w-5 h-5 text-slate-600"
                                />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-600">
                                    Total Klik
                                </p>
                                <p className="text-xl font-bold text-slate-800">
                                    {stats.overview.totalClicks.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions - Simple */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                        Kelola Sistem
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Link
                            href="/admin/users"
                            className="flex items-center p-3 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors"
                        >
                            <Icon
                                icon="ph:users"
                                className="w-5 h-5 text-sky-600 mr-3"
                            />
                            <div>
                                <p className="font-medium text-slate-800 text-sm">
                                    Kelola Pengguna
                                </p>
                                <p className="text-xs text-slate-500">
                                    {stats.overview.totalUsers} pengguna
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/admin/categories"
                            className="flex items-center p-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                        >
                            <Icon
                                icon="ph:grid-four"
                                className="w-5 h-5 text-emerald-600 mr-3"
                            />
                            <div>
                                <p className="font-medium text-slate-800 text-sm">
                                    Kelola Kategori
                                </p>
                                <p className="text-xs text-slate-500">
                                    {stats.overview.totalCategories} kategori
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/admin/articles"
                            className="flex items-center p-3 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
                        >
                            <Icon
                                icon="ph:article"
                                className="w-5 h-5 text-teal-600 mr-3"
                            />
                            <div>
                                <p className="font-medium text-slate-800 text-sm">
                                    Kelola Artikel
                                </p>
                                <p className="text-xs text-slate-500">
                                    {stats.overview.totalArticles} artikel
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Performance Overview - Simple Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Linktrees */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">
                            Linktree Terpopuler
                        </h3>
                        <div className="space-y-2">
                            {stats.topLinktrees
                                .slice(0, 5)
                                .map((linktree, index) => (
                                    <div
                                        key={linktree.id}
                                        className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-sm font-medium text-slate-400 w-4">
                                                {index + 1}
                                            </span>
                                            <div>
                                                <p className="font-medium text-slate-800 text-sm">
                                                    {linktree.title}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {linktree.user.name}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-600">
                                            {linktree._count.views.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Popular Categories */}
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
                        <div className="space-y-2">
                            {stats.popularCategories
                                .slice(0, 5)
                                .map((category, index) => (
                                    <div
                                        key={category.id}
                                        className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-sm font-medium text-slate-400 w-4">
                                                {index + 1}
                                            </span>
                                            <span className="text-sm font-medium text-slate-800">
                                                {category.icon} {category.name}
                                            </span>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-600">
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <div className="text-xl font-bold text-emerald-600">
                                {stats.ratios.clickThroughRate}%
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                                Click Rate
                            </div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <div className="text-xl font-bold text-sky-600">
                                {stats.ratios.linktreesPerUser}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                                Linktree per User
                            </div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <div className="text-xl font-bold text-teal-600">
                                {stats.ratios.linksPerLinktree}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                                Link per Linktree
                            </div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <div className="text-xl font-bold text-slate-600">
                                {stats.ratios.averageClicksPerLink}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                                Avg Klik per Link
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
