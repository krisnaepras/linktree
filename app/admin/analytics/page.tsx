"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AdminLayout from "@/components/AdminLayout";
import { Icon } from "@iconify/react";

type AnalyticsData = {
    totalUsers: number;
    totalLinktrees: number;
    totalViews: number;
    totalArticles: number;
    recentActivity: {
        type: string;
        description: string;
        timestamp: string;
    }[];
    topLinktrees: {
        id: string;
        title: string;
        slug: string;
        views: number;
        user: {
            name: string;
        };
    }[];
    topArticles: {
        id: string;
        title: string;
        slug: string;
        viewCount: number;
        author: {
            name: string;
        };
    }[];
    // SuperAdmin specific data
    userGrowth?: {
        totalRegularUsers: number;
        totalAdmins: number;
        totalSuperAdmins: number;
        userGrowthRate: number;
        monthlyGrowth: { month: string; users: number }[];
    };
    systemStats?: {
        totalCategories: number;
        totalLinks: number;
        averageLinksPerLinktree: number;
        averageViewsPerLinktree: number;
        topCategories: { name: string; count: number }[];
    };
};

export default function Analytics() {
    const { data: session } = useSession();
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    const isSuperAdmin = session?.user?.role === "SUPERADMIN";

    useEffect(() => {
        fetchAnalyticsData();

        // Auto-refresh every 5 minutes for real-time analytics
        const interval = setInterval(() => {
            fetchAnalyticsData();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    // Real-time clock
    useEffect(() => {
        const clockInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(clockInterval);
    }, []);

    const fetchAnalyticsData = async () => {
        try {
            const response = await fetch("/api/admin/analytics");
            if (!response.ok) {
                throw new Error("Failed to fetch analytics data");
            }
            const data = await response.json();
            setAnalyticsData(data);
        } catch (error) {
            setError(
                error instanceof Error ? error.message : "An error occurred"
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <Icon
                            icon="ph:warning"
                            className="w-5 h-5 text-red-600 mr-2"
                        />
                        <p className="text-red-700">{error}</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 rounded-xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Icon
                                    icon="ph:chart-bar"
                                    className="w-7 h-7 text-white"
                                />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">
                                    {isSuperAdmin
                                        ? "Advanced Analytics"
                                        : "Analytics"}
                                </h1>
                                <p className="text-orange-100 mt-1">
                                    {isSuperAdmin
                                        ? "Analisis mendalam dan monitoring sistem real-time"
                                        : "Analisis performa dan statistik platform"}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-semibold">
                                {currentTime.toLocaleDateString("id-ID", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "short"
                                })}
                            </div>
                            <div className="text-orange-200 text-sm">
                                {currentTime.toLocaleTimeString("id-ID")}
                            </div>
                            <div className="flex items-center justify-end mt-2">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                                <span className="text-xs text-orange-100">
                                    Live Data
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {analyticsData && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Total Users
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {analyticsData.totalUsers}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Icon
                                            icon="ph:users"
                                            className="w-6 h-6 text-blue-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Total Linktrees
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {analyticsData.totalLinktrees}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Icon
                                            icon="ph:link"
                                            className="w-6 h-6 text-green-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Total Views
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {analyticsData.totalViews}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Icon
                                            icon="ph:eye"
                                            className="w-6 h-6 text-purple-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Total Articles
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {analyticsData.totalArticles}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Icon
                                            icon="ph:article"
                                            className="w-6 h-6 text-orange-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SuperAdmin Advanced Analytics */}
                        {isSuperAdmin &&
                            analyticsData.userGrowth &&
                            analyticsData.systemStats && (
                                <>
                                    {/* User Growth & System Performance */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* User Growth Analysis */}
                                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    User Growth Analysis
                                                </h3>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                                    <span className="text-sm text-gray-500">
                                                        Live
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                            <Icon
                                                                icon="ph:user"
                                                                className="w-5 h-5 text-emerald-600"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-600">
                                                                Regular Users
                                                            </p>
                                                            <p className="text-2xl font-bold text-gray-900">
                                                                {
                                                                    analyticsData
                                                                        .userGrowth
                                                                        .totalRegularUsers
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                            {analyticsData
                                                                .userGrowth
                                                                .userGrowthRate >
                                                            0
                                                                ? "↗"
                                                                : "↘"}
                                                            {Math.abs(
                                                                analyticsData
                                                                    .userGrowth
                                                                    .userGrowthRate
                                                            )}
                                                            %
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-3 bg-sky-50 rounded-lg">
                                                        <p className="text-xs text-sky-600 font-medium">
                                                            ADMINS
                                                        </p>
                                                        <p className="text-xl font-bold text-sky-800">
                                                            {
                                                                analyticsData
                                                                    .userGrowth
                                                                    .totalAdmins
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="p-3 bg-violet-50 rounded-lg">
                                                        <p className="text-xs text-violet-600 font-medium">
                                                            SUPERADMINS
                                                        </p>
                                                        <p className="text-xl font-bold text-violet-800">
                                                            {
                                                                analyticsData
                                                                    .userGrowth
                                                                    .totalSuperAdmins
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* System Performance */}
                                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    System Performance
                                                </h3>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                    <span className="text-sm text-gray-500">
                                                        Real-time
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-600">
                                                                    Total
                                                                    Categories
                                                                </p>
                                                                <p className="text-2xl font-bold text-blue-800">
                                                                    {
                                                                        analyticsData
                                                                            .systemStats
                                                                            .totalCategories
                                                                    }
                                                                </p>
                                                            </div>
                                                            <Icon
                                                                icon="ph:folder-open"
                                                                className="w-8 h-8 text-blue-600"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-600">
                                                                    Total Links
                                                                </p>
                                                                <p className="text-2xl font-bold text-purple-800">
                                                                    {
                                                                        analyticsData
                                                                            .systemStats
                                                                            .totalLinks
                                                                    }
                                                                </p>
                                                            </div>
                                                            <Icon
                                                                icon="ph:link-simple"
                                                                className="w-8 h-8 text-purple-600"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-3 bg-amber-50 rounded-lg text-center">
                                                        <p className="text-xs text-amber-600 font-medium">
                                                            AVG LINKS/LINKTREE
                                                        </p>
                                                        <p className="text-lg font-bold text-amber-800">
                                                            {analyticsData.systemStats.averageLinksPerLinktree.toFixed(
                                                                1
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="p-3 bg-rose-50 rounded-lg text-center">
                                                        <p className="text-xs text-rose-600 font-medium">
                                                            AVG VIEWS/LINKTREE
                                                        </p>
                                                        <p className="text-lg font-bold text-rose-800">
                                                            {analyticsData.systemStats.averageViewsPerLinktree.toFixed(
                                                                1
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Top Categories Analytics */}
                                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Top Categories Performance
                                            </h3>
                                            <div className="flex items-center space-x-2">
                                                <Icon
                                                    icon="ph:chart-pie"
                                                    className="w-5 h-5 text-gray-400"
                                                />
                                                <span className="text-sm text-gray-500">
                                                    Category Distribution
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {analyticsData.systemStats.topCategories.map(
                                                (category, index) => (
                                                    <div
                                                        key={category.name}
                                                        className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-3">
                                                                <div
                                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                                        index ===
                                                                        0
                                                                            ? "bg-yellow-100"
                                                                            : index ===
                                                                              1
                                                                            ? "bg-slate-100"
                                                                            : index ===
                                                                              2
                                                                            ? "bg-amber-100"
                                                                            : "bg-gray-100"
                                                                    }`}
                                                                >
                                                                    <span
                                                                        className={`text-sm font-bold ${
                                                                            index ===
                                                                            0
                                                                                ? "text-yellow-600"
                                                                                : index ===
                                                                                  1
                                                                                ? "text-slate-600"
                                                                                : index ===
                                                                                  2
                                                                                ? "text-amber-600"
                                                                                : "text-gray-600"
                                                                        }`}
                                                                    >
                                                                        #
                                                                        {index +
                                                                            1}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {
                                                                            category.count
                                                                        }{" "}
                                                                        linktrees
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full ${
                                                                            index ===
                                                                            0
                                                                                ? "bg-yellow-500"
                                                                                : index ===
                                                                                  1
                                                                                ? "bg-slate-500"
                                                                                : index ===
                                                                                  2
                                                                                ? "bg-amber-500"
                                                                                : "bg-gray-500"
                                                                        }`}
                                                                        style={{
                                                                            width: `${Math.min(
                                                                                (category.count /
                                                                                    (analyticsData
                                                                                        .systemStats
                                                                                        ?.topCategories[0]
                                                                                        ?.count ||
                                                                                        1)) *
                                                                                    100,
                                                                                100
                                                                            )}%`
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                        {/* Charts and Tables */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Top Linktrees */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Top Linktrees
                                </h3>
                                <div className="space-y-3">
                                    {analyticsData.topLinktrees.map(
                                        (linktree, index) => (
                                            <div
                                                key={linktree.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <span className="text-sm font-medium text-blue-600">
                                                            #{index + 1}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {linktree.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            by{" "}
                                                            {linktree.user.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {linktree.views}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        views
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Top Articles */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Top Articles
                                </h3>
                                <div className="space-y-3">
                                    {analyticsData.topArticles.map(
                                        (article, index) => (
                                            <div
                                                key={article.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                                        <span className="text-sm font-medium text-orange-600">
                                                            #{index + 1}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {article.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            by{" "}
                                                            {
                                                                article.author
                                                                    .name
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {article.viewCount}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        views
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Recent Activity
                            </h3>
                            <div className="space-y-3">
                                {analyticsData.recentActivity.map(
                                    (activity, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Icon
                                                    icon="material-symbols:history"
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {activity.type}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {activity.description}
                                                </p>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(
                                                    activity.timestamp
                                                ).toLocaleString()}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
