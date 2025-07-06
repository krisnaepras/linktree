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
};

export default function Analytics() {
    const { data: session } = useSession();
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAnalyticsData();
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
                            icon="material-symbols:error-outline"
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                            <Icon
                                icon="material-symbols:analytics-outline"
                                className="w-6 h-6 text-white"
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Analytics
                            </h1>
                            <p className="text-gray-600">
                                Analisis performa dan statistik platform
                            </p>
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
                                            icon="material-symbols:people-outline"
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
                                            icon="material-symbols:link"
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
                                            icon="material-symbols:visibility-outline"
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
                                            icon="material-symbols:article-outline"
                                            className="w-6 h-6 text-orange-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

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
