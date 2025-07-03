"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DraggableLinks from "@/components/DraggableLinks";
import QuickStats from "@/components/QuickStats";

type Linktree = {
    id: string;
    photo: string | null;
    title: string;
    slug: string;
    isActive: boolean;
    detailLinktrees: DetailLinktree[];
};

type DetailLinktree = {
    id: string;
    title: string;
    url: string;
    sortOrder: number;
    isVisible: boolean;
    category: Category;
};

type Category = {
    id: string;
    name: string;
    icon: string | null;
};

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [linktree, setLinktree] = useState<Linktree | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalLinks: 0,
        visibleLinks: 0,
        hiddenLinks: 0,
        activeLinktree: false
    });

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        fetchLinktree();
    }, [status, router]);

    const fetchLinktree = async () => {
        try {
            const response = await fetch("/api/linktree");
            if (response.ok) {
                const data = await response.json();
                setLinktree(data);

                // Calculate statistics
                if (data) {
                    const totalLinks = data.detailLinktrees.length;
                    const visibleLinks = data.detailLinktrees.filter(
                        (link: DetailLinktree) => link.isVisible
                    ).length;
                    const hiddenLinks = totalLinks - visibleLinks;

                    setStats({
                        totalLinks,
                        visibleLinks,
                        hiddenLinks,
                        activeLinktree: data.isActive
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching linktree:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReorderLinks = async (reorderedLinks: DetailLinktree[]) => {
        try {
            // Update local state immediately for better UX
            if (linktree) {
                setLinktree({
                    ...linktree,
                    detailLinktrees: reorderedLinks
                });
            }

            // Send update to server
            const response = await fetch("/api/links/reorder", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    links: reorderedLinks.map((link) => ({
                        id: link.id,
                        sortOrder: link.sortOrder
                    }))
                })
            });

            if (!response.ok) {
                // Revert on error
                fetchLinktree();
                console.error("Failed to update link order");
            }
        } catch (error) {
            console.error("Error reordering links:", error);
            // Revert on error
            fetchLinktree();
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">
                                LinkUMKM Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            {session.user.role === "ADMIN" && (
                                <Link
                                    href="/dashboard/admin"
                                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                                >
                                    Admin
                                </Link>
                            )}
                            <Link
                                href="/dashboard/profile"
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Profil
                            </Link>
                            <span className="text-sm text-gray-600">
                                Halo, {session.user.name}!
                            </span>
                            <button
                                onClick={() => router.push("/api/auth/signout")}
                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                                Keluar
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Halo, {session.user.name}!
                    </h2>
                    <p className="text-gray-600">
                        Kelola linktree UMKM Anda dengan mudah
                    </p>
                </div>

                {/* Statistics Cards */}
                {linktree && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <svg
                                        className="w-6 h-6 text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Link
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.totalLinks}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <svg
                                        className="w-6 h-6 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">
                                        Link Tampil
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.visibleLinks}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <svg
                                        className="w-6 h-6 text-yellow-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L9.878 9.878a3 3 0 013.29-3.29m0 0a3 3 0 113.29 3.29m0 0l-4.242 4.242m4.242-4.242L15.17 15.17"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">
                                        Link Tersembunyi
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.hiddenLinks}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div
                                    className={`p-2 rounded-lg ${
                                        stats.activeLinktree
                                            ? "bg-green-100"
                                            : "bg-red-100"
                                    }`}
                                >
                                    <svg
                                        className={`w-6 h-6 ${
                                            stats.activeLinktree
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">
                                        Status
                                    </p>
                                    <p
                                        className={`text-2xl font-bold ${
                                            stats.activeLinktree
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {stats.activeLinktree
                                            ? "Aktif"
                                            : "Nonaktif"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!linktree ? (
                    // No Linktree Created Yet
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="mb-6">
                                <svg
                                    className="mx-auto h-16 w-16 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1}
                                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-4">
                                Buat Linktree Pertama Anda
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Anda belum memiliki linktree. Mulai dengan
                                membuat linktree pertama untuk UMKM Anda.
                            </p>
                            <Link
                                href="/dashboard/linktree/create"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                                Buat Linktree Baru
                            </Link>
                        </div>
                    </div>
                ) : (
                    // Linktree Exists
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Linktree Info Card */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        Linktree Anda
                                    </h3>
                                    <div className="flex items-center space-x-3">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                linktree.isActive
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {linktree.isActive
                                                ? "Aktif"
                                                : "Nonaktif"}
                                        </span>
                                        <Link
                                            href={`/dashboard/linktree/edit`}
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                        >
                                            Edit
                                        </Link>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    {linktree.photo && (
                                        <Image
                                            src={linktree.photo}
                                            alt="Linktree Photo"
                                            width={64}
                                            height={64}
                                            className="rounded-lg object-cover"
                                        />
                                    )}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900">
                                            {linktree.title}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            linkumkm.com/{linktree.slug}
                                        </p>
                                        <Link
                                            href={`/${linktree.slug}`}
                                            target="_blank"
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            Lihat Halaman Publik →
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Links Management */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        Daftar Link (
                                        {linktree.detailLinktrees.length})
                                    </h3>
                                    <Link
                                        href="/dashboard/links/create"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                    >
                                        Tambah Link
                                    </Link>
                                </div>

                                {linktree.detailLinktrees.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">
                                            Belum ada link. Tambahkan link
                                            pertama Anda!
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <svg
                                                    className="w-5 h-5 text-blue-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                <p className="text-sm text-blue-800">
                                                    Drag & drop untuk mengubah
                                                    urutan link
                                                </p>
                                            </div>
                                        </div>

                                        <DraggableLinks
                                            links={linktree.detailLinktrees}
                                            onReorder={handleReorderLinks}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar with Stats */}
                        <div className="lg:col-span-1">
                            <QuickStats linktreeSlug={linktree.slug} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
