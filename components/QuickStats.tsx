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
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-slate-200">
                <div className="animate-pulse">
                    <div className="h-6 bg-slate-200 rounded-lg w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-slate-200 rounded-lg w-1/2"></div>
                        <div className="h-4 bg-slate-200 rounded-lg w-2/3"></div>
                        <div className="h-4 bg-slate-200 rounded-lg w-1/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Statistik Cepat
                </h3>
                <div className="text-center py-8">
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
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                    </div>
                    <p className="text-slate-600">
                        Statistik belum tersedia. Bagikan linktree Anda untuk
                        melihat data!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Statistik Cepat
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-gradient-to-r from-sky-50 to-sky-100 rounded-xl border border-sky-200">
                    <div className="text-2xl font-bold text-sky-600">
                        {stats.profileViews}
                    </div>
                    <div className="text-sm text-slate-600">
                        Total Kunjungan
                    </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                    <div className="text-2xl font-bold text-emerald-600">
                        {stats.totalClicks}
                    </div>
                    <div className="text-sm text-slate-600">
                        Total Klik Link
                    </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl border border-teal-200">
                    <div className="text-2xl font-bold text-teal-600">
                        {stats.todayViews}
                    </div>
                    <div className="text-sm text-slate-600">Hari Ini</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                    <div className="text-2xl font-bold text-slate-600">
                        {stats.weeklyViews}
                    </div>
                    <div className="text-sm text-slate-600">Minggu Ini</div>
                </div>
            </div>

            {stats.topLinks.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-slate-800 mb-3">
                        Link Terpopuler
                    </h4>
                    <div className="space-y-2">
                        {stats.topLinks.slice(0, 3).map((link, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:bg-slate-100"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">
                                        {link.title}
                                    </p>
                                    <p className="text-xs text-slate-600 truncate">
                                        {link.url}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-slate-800">
                                        {link.clicks}
                                    </span>
                                    <span className="text-xs text-slate-500">
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
