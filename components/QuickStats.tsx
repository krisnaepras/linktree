"use client";

import { useState, useEffect } from "react";

interface QuickStatsProps {
    linktreeSlug?: string;
}

type Stats = {
    profileViews: number;
    totalClicks: number;
    topLinks: Array<{
        title: string;
        clicks: number;
        url: string;
    }>;
    todayViews: number;
    weeklyViews: number;
};

export default function QuickStats({ linktreeSlug }: QuickStatsProps) {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (linktreeSlug) {
            fetchStats();
        }
    }, [linktreeSlug]);

    const fetchStats = async () => {
        try {
            const response = await fetch(`/api/stats?slug=${linktreeSlug}`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Statistik Cepat
                </h3>
                <div className="text-center py-8">
                    <p className="text-gray-600">
                        Statistik belum tersedia. Bagikan linktree Anda untuk
                        melihat data!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Statistik Cepat
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                        {stats.profileViews}
                    </div>
                    <div className="text-sm text-gray-600">Total Kunjungan</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                        {stats.totalClicks}
                    </div>
                    <div className="text-sm text-gray-600">Total Klik Link</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                        {stats.todayViews}
                    </div>
                    <div className="text-sm text-gray-600">Hari Ini</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                        {stats.weeklyViews}
                    </div>
                    <div className="text-sm text-gray-600">Minggu Ini</div>
                </div>
            </div>

            {stats.topLinks.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Link Terpopuler
                    </h4>
                    <div className="space-y-2">
                        {stats.topLinks.slice(0, 3).map((link, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {link.title}
                                    </p>
                                    <p className="text-xs text-gray-600 truncate">
                                        {link.url}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-900">
                                        {link.clicks}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        klik
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
