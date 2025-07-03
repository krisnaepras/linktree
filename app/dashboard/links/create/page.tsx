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
    sortOrder: z.number().optional(),
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/dashboard"
                                className="text-blue-600 hover:text-blue-700"
                            >
                                ← Kembali
                            </Link>
                            <h1 className="text-xl font-semibold text-gray-900">
                                Tambah Link Baru
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                Halo, {session?.user?.name}!
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Tambah Link Baru
                        </h2>
                        <p className="text-gray-600">
                            Tambahkan tautan yang ingin Anda tampilkan di
                            halaman linktree
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
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
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Judul Link *
                            </label>
                            <input
                                type="text"
                                id="title"
                                {...register("title")}
                                placeholder="Contoh: Follow Instagram Kami"
                                className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
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
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                URL Link *
                            </label>
                            <input
                                type="url"
                                id="url"
                                {...register("url")}
                                placeholder="https://instagram.com/warungibusari"
                                className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
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
                                className="block text-sm font-medium text-gray-700 mb-2"
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
                                className="block text-sm font-medium text-gray-700 mb-2"
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
                                className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Kosongkan untuk menempatkan di urutan terakhir
                            </p>
                        </div>

                        {/* Is Visible */}
                        <div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isVisible"
                                    {...register("isVisible")}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="isVisible"
                                    className="ml-2 block text-sm text-gray-700"
                                >
                                    Tampilkan link ini di halaman publik
                                </label>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                Jika tidak dicentang, link akan tersembunyi dari
                                pengunjung
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                            <Link
                                href="/dashboard"
                                className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
