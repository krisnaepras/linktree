"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

export default function EditLinkPage({ params }: { params: { id: string } }) {
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
        reset
    } = useForm<EditLinkFormData>({
        resolver: zodResolver(editLinkSchema)
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated") {
            fetchData();
        }
    }, [status, router, params.id]);

    const fetchData = async () => {
        try {
            // Fetch categories and link data in parallel
            const [categoriesResponse, linkResponse] = await Promise.all([
                fetch("/api/categories"),
                fetch(`/api/links/${params.id}`)
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
            const response = await fetch(`/api/links/${params.id}`, {
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
        if (!confirm("Apakah Anda yakin ingin menghapus link ini?")) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/links/${params.id}`, {
                method: "DELETE"
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

    if (!link) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Link tidak ditemukan</p>
                    <Link
                        href="/dashboard"
                        className="text-blue-600 hover:text-blue-700"
                    >
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        );
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
                                Edit Link
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
                            Edit Link
                        </h2>
                        <p className="text-gray-600">
                            Perbarui informasi tautan Anda
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
                            <select
                                id="categoryId"
                                {...register("categoryId")}
                                className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                            >
                                <option value="">Pilih kategori</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.icon && `${category.icon} `}
                                        {category.name}
                                    </option>
                                ))}
                            </select>
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

                        {/* Submit Buttons */}
                        <div className="flex justify-between">
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Hapus Link
                            </button>

                            <div className="flex space-x-4">
                                <Link
                                    href="/dashboard"
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isLoading
                                        ? "Menyimpan..."
                                        : "Simpan Perubahan"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
