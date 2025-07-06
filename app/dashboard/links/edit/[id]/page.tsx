"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CategoryDropdown from "@/components/CategoryDropdown";
import Swal from "sweetalert2";

const editLinkSchema = z.object({
    title: z
        .string()
        .min(1, "Judul harus diisi")
        .max(100, "Judul maksimal 100 karakter"),
    url: z.string().url("URL tidak valid"),
    categoryId: z.string().min(1, "Kategori harus dipilih"),
    sortOrder: z.number().optional(),
    isVisible: z.boolean()
});

type EditLinkFormData = z.infer<typeof editLinkSchema>;

type Category = {
    id: string;
    name: string;
    icon: string | null;
};

type DetailLinktree = {
    id: string;
    title: string;
    url: string;
    sortOrder: number;
    isVisible: boolean;
    category: Category;
};

export default function EditLinkPage({
    params
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [link, setLink] = useState<DetailLinktree | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue
    } = useForm<EditLinkFormData>({
        resolver: zodResolver(editLinkSchema)
    });

    // Watch categoryId value
    const categoryId = watch("categoryId") || "";

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated") {
            fetchData();
        }
    }, [status, router, id]);

    const fetchData = async () => {
        try {
            // Fetch categories and link data in parallel
            const [categoriesResponse, linkResponse] = await Promise.all([
                fetch("/api/categories"),
                fetch(`/api/links/${id}`)
            ]);

            if (categoriesResponse.ok) {
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData);
            }

            if (linkResponse.ok) {
                const linkData = await linkResponse.json();
                setLink(linkData);
                reset({
                    title: linkData.title,
                    url: linkData.url,
                    categoryId: linkData.category.id,
                    sortOrder: linkData.sortOrder,
                    isVisible: linkData.isVisible
                });
            } else if (linkResponse.status === 404) {
                setError("Link tidak ditemukan");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Gagal memuat data");
        } finally {
            setIsFetching(false);
        }
    };

    const onSubmit = async (data: EditLinkFormData) => {
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(`/api/links/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                router.push("/dashboard");
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Terjadi kesalahan");
            }
        } catch (error) {
            setError("Terjadi kesalahan pada server");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: "Hapus Link?",
            text: "Tindakan ini tidak dapat dibatalkan. Link akan dihapus permanen.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            reverseButtons: true
        });

        if (!result.isConfirmed) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/links/${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                await Swal.fire({
                    title: "Berhasil!",
                    text: "Link berhasil dihapus.",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                });
                router.push("/dashboard");
            } else {
                const errorData = await response.json();
                await Swal.fire({
                    title: "Gagal!",
                    text:
                        errorData.error ||
                        "Terjadi kesalahan saat menghapus link.",
                    icon: "error",
                    confirmButtonColor: "#dc2626"
                });
                setError(errorData.error || "Terjadi kesalahan");
            }
        } catch (error) {
            await Swal.fire({
                title: "Gagal!",
                text: "Terjadi kesalahan pada server.",
                icon: "error",
                confirmButtonColor: "#dc2626"
            });
            setError("Terjadi kesalahan pada server");
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "loading" || isFetching) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-teal-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">L</span>
                    </div>
                    <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-slate-600 font-medium">Memuat...</p>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return null;
    }

    if (!link) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 flex items-center justify-center">
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
                        Link tidak ditemukan
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-sky-600 hover:text-sky-700 font-medium bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-xl border border-sky-200"
                    >
                        <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center text-sky-600 hover:text-sky-700 font-medium bg-sky-50 hover:bg-sky-100 px-3 py-2 rounded-xl border border-sky-200"
                            >
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                                Kembali
                            </Link>
                            <h1 className="text-xl font-semibold text-slate-800">
                                Edit Link
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-teal-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                    {session?.user?.name
                                        ?.charAt(0)
                                        .toUpperCase()}
                                </span>
                            </div>
                            <span className="text-sm text-slate-600 font-medium hidden sm:block">
                                {session?.user?.name}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-slate-200">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            Edit Link
                        </h2>
                        <p className="text-slate-600">
                            Perbarui informasi tautan Anda
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        {/* Title */}
                        <div>
                            <label
                                htmlFor="title"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Judul Link *
                            </label>
                            <input
                                type="text"
                                id="title"
                                {...register("title")}
                                placeholder="Contoh: Follow Instagram Kami"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.title.message}
                                </p>
                            )}
                        </div>

                        {/* URL */}
                        <div>
                            <label
                                htmlFor="url"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                URL *
                            </label>
                            <input
                                type="url"
                                id="url"
                                {...register("url")}
                                placeholder="https://instagram.com/warungmakan"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                            {errors.url && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.url.message}
                                </p>
                            )}
                        </div>

                        {/* Category */}
                        <div>
                            <label
                                htmlFor="categoryId"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Kategori *
                            </label>
                            <CategoryDropdown
                                categories={categories}
                                selectedCategoryId={categoryId}
                                onSelect={(id) => setValue("categoryId", id)}
                                placeholder="Pilih kategori"
                                error={errors.categoryId?.message}
                                loading={isFetching}
                            />
                            {errors.categoryId && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.categoryId.message}
                                </p>
                            )}
                        </div>

                        {/* Sort Order */}
                        <div>
                            <label
                                htmlFor="sortOrder"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Urutan Tampil
                            </label>
                            <input
                                type="number"
                                id="sortOrder"
                                {...register("sortOrder", {
                                    valueAsNumber: true
                                })}
                                placeholder="1"
                                min="1"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                            <p className="mt-1 text-sm text-slate-500">
                                Nomor urutan untuk menentukan posisi link
                            </p>
                        </div>

                        {/* Is Visible */}
                        <div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isVisible"
                                    {...register("isVisible")}
                                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
                                />
                                <label
                                    htmlFor="isVisible"
                                    className="ml-2 block text-sm text-slate-700 font-medium"
                                >
                                    Tampilkan link ini di halaman publik
                                </label>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">
                                Jika tidak dicentang, link akan tersembunyi dari
                                pengunjung
                            </p>
                        </div>

                        {/* Submit Buttons */}
                        <div className="space-y-6">
                            {/* Main action buttons */}
                            <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                                <Link
                                    href="/dashboard"
                                    className="w-full sm:w-auto px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium text-center"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
                                >
                                    {isLoading
                                        ? "Menyimpan..."
                                        : "Simpan Perubahan"}
                                </button>
                            </div>

                            {/* Danger zone - Delete button separated */}
                            <div className="pt-6 border-t border-slate-200">
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                        <div className="mb-3 sm:mb-0">
                                            <h3 className="text-sm font-medium text-red-800">
                                                Hapus Link
                                            </h3>
                                            <p className="text-sm text-red-600 mt-1">
                                                Tindakan ini tidak dapat
                                                dibatalkan. Link akan dihapus
                                                permanen.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            disabled={isLoading}
                                            className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
                                        >
                                            Hapus Link
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
