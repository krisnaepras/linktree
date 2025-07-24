"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CategoryDropdown from "@/components/CategoryDropdown";

const createLinkSchema = z.object({
    title: z
        .string()
        .min(1, "Judul harus diisi")
        .max(100, "Judul maksimal 100 karakter"),
    url: z.string().url("URL tidak valid"),
    categoryId: z.string().min(1, "Kategori harus dipilih"),
    // sortOrder: z.number().optional(),    
    isVisible: z.boolean().optional()
});

type CreateLinkFormData = z.infer<typeof createLinkSchema>;

type Category = {
    id: string;
    name: string;
    icon: string | null;
};

export default function CreateLinkPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue
    } = useForm<CreateLinkFormData>({
        resolver: zodResolver(createLinkSchema),
        defaultValues: {
            isVisible: true
        }
    });

    // Watch categoryId value
    const categoryId = watch("categoryId") || "";

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated") {
            fetchCategories();
        }
    }, [status, router]);

    const fetchCategories = async () => {
        try {
            const response = await fetch("/api/categories");
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            setError("Gagal memuat kategori");
        } finally {
            setIsFetching(false);
        }
    };

    const onSubmit = async (data: CreateLinkFormData) => {
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/links", {
                method: "POST",
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
                                Tambah Link Baru
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
                            Tambah Link Baru
                        </h2>
                        <p className="text-slate-600">
                            Tambahkan tautan yang ingin Anda tampilkan di
                            halaman linktree
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
                                URL Link *
                            </label>
                            <input
                                type="url"
                                id="url"
                                {...register("url")}
                                placeholder="https://instagram.com/warungibusari"
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
                        {/* <div>
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
                                Kosongkan untuk menempatkan di urutan terakhir
                            </p>
                        </div> */}

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

                        {/* Submit Button */}
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
                                {isLoading ? "Menyimpan..." : "Tambah Link"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
