"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import AdminLayout from "@/components/AdminLayout";
import Swal from "sweetalert2";

type StorageStats = {
    totalFiles: number;
    totalSize: string;
    categoriesCount: number;
    articlesCount: number;
    linktreePhotosCount: number;
    unusedFiles: Array<{
        file: string;
        path: string;
        size: string;
        lastModified: string;
    }>;
};

export default function SystemCleanupPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<StorageStats | null>(null);
    const [isCleaningUp, setIsCleaningUp] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

    // Check authentication and role
    useEffect(() => {
        if (!session) {
            router.push("/login");
            return;
        }

        if (session.user.role !== "SUPERADMIN") {
            router.push("/admin");
            return;
        }
    }, [session, router]);

    // Fetch storage statistics
    const fetchStorageStats = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/system-cleanup/stats");

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            } else {
                throw new Error("Failed to fetch storage stats");
            }
        } catch (error) {
            console.error("Error fetching storage stats:", error);
            Swal.fire({
                title: "Error",
                text: "Gagal memuat statistik storage",
                icon: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.role === "SUPERADMIN") {
            fetchStorageStats();
        }
    }, [session]);

    const handleCleanupUnusedFiles = async () => {
        const result = await Swal.fire({
            title: "Konfirmasi Cleanup",
            text: `Hapus ${
                selectedFiles.length > 0
                    ? selectedFiles.length
                    : stats?.unusedFiles.length || 0
            } file yang tidak digunakan?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        try {
            setIsCleaningUp(true);
            const response = await fetch(
                "/api/admin/system-cleanup/unused-files",
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        files:
                            selectedFiles.length > 0 ? selectedFiles : undefined
                    })
                }
            );

            if (response.ok) {
                const result = await response.json();
                await Swal.fire({
                    title: "Berhasil!",
                    text: `${result.deletedCount} file berhasil dihapus. Space yang dibebaskan: ${result.freedSpace}`,
                    icon: "success",
                    timer: 3000,
                    showConfirmButton: false
                });

                // Reset selection and refresh stats
                setSelectedFiles([]);
                fetchStorageStats();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || "Cleanup failed");
            }
        } catch (error) {
            console.error("Error during cleanup:", error);
            Swal.fire({
                title: "Error",
                text:
                    error instanceof Error
                        ? error.message
                        : "Gagal melakukan cleanup",
                icon: "error"
            });
        } finally {
            setIsCleaningUp(false);
        }
    };

    const handleSelectFile = (filePath: string) => {
        setSelectedFiles((prev) =>
            prev.includes(filePath)
                ? prev.filter((f) => f !== filePath)
                : [...prev, filePath]
        );
    };

    const handleSelectAll = () => {
        if (selectedFiles.length === stats?.unusedFiles.length) {
            setSelectedFiles([]);
        } else {
            setSelectedFiles(stats?.unusedFiles.map((f) => f.path) || []);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                System Cleanup
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Kelola dan bersihkan file-file yang tidak
                                digunakan
                            </p>
                        </div>
                        <button
                            onClick={fetchStorageStats}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Icon
                                icon="material-symbols:refresh"
                                className="w-4 h-4 mr-2"
                            />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Storage Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100">
                                <Icon
                                    icon="material-symbols:folder-outline"
                                    className="w-6 h-6 text-blue-600"
                                />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">
                                    Total Files
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stats?.totalFiles || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100">
                                <Icon
                                    icon="material-symbols:storage"
                                    className="w-6 h-6 text-green-600"
                                />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">
                                    Total Size
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stats?.totalSize || "0 B"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-yellow-100">
                                <Icon
                                    icon="material-symbols:warning-outline"
                                    className="w-6 h-6 text-yellow-600"
                                />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">
                                    Unused Files
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stats?.unusedFiles.length || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-red-100">
                                <Icon
                                    icon="material-symbols:cleaning-services-outline"
                                    className="w-6 h-6 text-red-600"
                                />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">
                                    Selected
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {selectedFiles.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* File Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Categories
                        </h3>
                        <p className="text-3xl font-bold text-blue-600">
                            {stats?.categoriesCount || 0}
                        </p>
                        <p className="text-sm text-gray-500">
                            category icon files
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Articles
                        </h3>
                        <p className="text-3xl font-bold text-green-600">
                            {stats?.articlesCount || 0}
                        </p>
                        <p className="text-sm text-gray-500">
                            article image files
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Linktree Photos
                        </h3>
                        <p className="text-3xl font-bold text-purple-600">
                            {stats?.linktreePhotosCount || 0}
                        </p>
                        <p className="text-sm text-gray-500">
                            linktree photo files
                        </p>
                    </div>
                </div>

                {/* Unused Files List */}
                {stats?.unusedFiles && stats.unusedFiles.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">
                                    File yang Tidak Digunakan (
                                    {stats.unusedFiles.length})
                                </h3>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={handleSelectAll}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        {selectedFiles.length ===
                                        stats.unusedFiles.length
                                            ? "Deselect All"
                                            : "Select All"}
                                    </button>
                                    <button
                                        onClick={handleCleanupUnusedFiles}
                                        disabled={
                                            isCleaningUp ||
                                            (selectedFiles.length === 0 &&
                                                stats.unusedFiles.length === 0)
                                        }
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Icon
                                            icon="material-symbols:delete-outline"
                                            className="w-4 h-4 mr-2"
                                        />
                                        {isCleaningUp
                                            ? "Menghapus..."
                                            : `Hapus ${
                                                  selectedFiles.length ||
                                                  stats.unusedFiles.length
                                              } File`}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    selectedFiles.length ===
                                                        stats.unusedFiles
                                                            .length &&
                                                    stats.unusedFiles.length > 0
                                                }
                                                onChange={handleSelectAll}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            File
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Size
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Last Modified
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {stats.unusedFiles.map((file, index) => (
                                        <tr
                                            key={file.path}
                                            className={
                                                index % 2 === 0
                                                    ? "bg-white"
                                                    : "bg-gray-50"
                                            }
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFiles.includes(
                                                        file.path
                                                    )}
                                                    onChange={() =>
                                                        handleSelectFile(
                                                            file.path
                                                        )
                                                    }
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {file.file}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {file.size}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(
                                                    file.lastModified
                                                ).toLocaleDateString("id-ID")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* No unused files message */}
                {stats?.unusedFiles && stats.unusedFiles.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div className="text-center">
                            <Icon
                                icon="material-symbols:check-circle-outline"
                                className="w-16 h-16 text-green-500 mx-auto mb-4"
                            />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                System Bersih!
                            </h3>
                            <p className="text-gray-500">
                                Tidak ada file yang tidak digunakan ditemukan.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
