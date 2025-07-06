"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import SlugInput from "@/components/SlugInput";

const editLinktreeSchema = z.object({
    title: z
        .string()
        .min(1, "Judul harus diisi")
        .max(100, "Judul maksimal 100 karakter"),
    slug: z
        .string()
        .min(3, "Slug minimal 3 karakter")
        .max(50, "Slug maksimal 50 karakter")
        .regex(
            /^[a-z0-9-]+$/,
            "Slug hanya boleh berisi huruf kecil, angka, dan tanda strip"
        ),
    photo: z.string().url("URL foto tidak valid").optional().or(z.literal("")),
    isActive: z.boolean()
});

type EditLinktreeFormData = z.infer<typeof editLinktreeSchema>;

type Linktree = {
    id: string;
    title: string;
    slug: string;
    photo: string | null;
    isActive: boolean;
};

export default function EditLinktreePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState("");
    const [linktree, setLinktree] = useState<Linktree | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [photoMethod, setPhotoMethod] = useState<"url" | "upload">("url");
    const [currentHost, setCurrentHost] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
        watch
    } = useForm<EditLinktreeFormData>({
        resolver: zodResolver(editLinktreeSchema)
    });

    // Watch the slug field for preview
    const watchedSlug = watch("slug", "");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated") {
            fetchLinktree();
        }
    }, [status, router]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setCurrentHost(window.location.host);
        }
    }, []);

    const fetchLinktree = async () => {
        try {
            const response = await fetch("/api/linktree");
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setLinktree(data);
                    reset({
                        title: data.title,
                        slug: data.slug,
                        photo: data.photo || "",
                        isActive: data.isActive
                    });
                } else {
                    router.push("/dashboard");
                }
            }
        } catch (error) {
            console.error("Error fetching linktree:", error);
            setError("Gagal memuat data linktree");
        } finally {
            setIsFetching(false);
        }
    };

    const onSubmit = async (data: EditLinktreeFormData) => {
        setIsLoading(true);
        setError("");

        try {
            let photoUrl = data.photo;

            // If user selected file upload method and has a file, upload it first
            if (photoMethod === "upload" && selectedFile) {
                const uploadedPath = await uploadPhotoFile();
                if (uploadedPath === null) {
                    setIsLoading(false);
                    return;
                }
                photoUrl = uploadedPath;
            }

            const response = await fetch("/api/linktree", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...data,
                    photo: photoUrl
                })
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const uploadPhotoFile = async (): Promise<string | null> => {
        if (!selectedFile) return null;

        const formData = new FormData();
        formData.append("photo", selectedFile);

        try {
            const response = await fetch("/api/upload/linktree-photo", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                return result.filePath;
            } else {
                const error = await response.json();
                setError(error.error || "Failed to upload file");
                return null;
            }
        } catch (error) {
            setError("Failed to upload file");
            return null;
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

    if (!linktree) {
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
                        Linktree tidak ditemukan
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
                                Edit Linktree
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
                            Edit Linktree UMKM Anda
                        </h2>
                        <p className="text-slate-600">
                            Perbarui informasi dasar untuk halaman linktree UMKM
                            Anda
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
                                Judul Linktree *
                            </label>
                            <input
                                type="text"
                                id="title"
                                {...register("title")}
                                placeholder="Contoh: Warung Makan Ibu Sari"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.title.message}
                                </p>
                            )}
                        </div>

                        {/* Slug */}
                        <div>
                            <label
                                htmlFor="slug"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                URL Slug *
                            </label>
                            <SlugInput
                                placeholder="warung-makan-ibu-sari"
                                register={register("slug")}
                            />
                            {errors.slug && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.slug.message}
                                </p>
                            )}
                            {watchedSlug && (
                                <p className="mt-2 text-sm text-slate-600">
                                    Preview:{" "}
                                    <span className="font-medium text-sky-700">
                                        {currentHost || "yoursite.com"}/
                                        {watchedSlug}
                                    </span>
                                </p>
                            )}
                            {/* <p className="mt-1 text-sm text-slate-500">
                                URL unik untuk halaman linktree Anda
                            </p> */}
                        </div>

                        {/* Photo */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Foto Profil
                            </label>

                            {/* Method selector */}
                            <div className="flex space-x-4 mb-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="photoMethod"
                                        value="url"
                                        checked={photoMethod === "url"}
                                        onChange={(e) => {
                                            setPhotoMethod("url");
                                            setSelectedFile(null);
                                            setPreviewUrl(null);
                                        }}
                                        className="mr-2 h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                                    />
                                    <span className="text-sm text-slate-700 font-medium">
                                        URL Gambar
                                    </span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="photoMethod"
                                        value="upload"
                                        checked={photoMethod === "upload"}
                                        onChange={(e) => {
                                            setPhotoMethod("upload");
                                        }}
                                        className="mr-2 h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                                    />
                                    <span className="text-sm text-slate-700 font-medium">
                                        Upload File
                                    </span>
                                </label>
                            </div>

                            {photoMethod === "url" ? (
                                <div>
                                    <input
                                        type="url"
                                        id="photo"
                                        {...register("photo")}
                                        placeholder="https://example.com/foto-umkm.jpg"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                    <p className="mt-1 text-sm text-slate-500">
                                        Masukkan URL gambar yang akan
                                        ditampilkan sebagai foto profil
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                    <p className="mt-1 text-sm text-slate-500">
                                        Format: JPG, PNG, GIF, WebP. Maksimal
                                        2MB
                                    </p>

                                    {/* Preview */}
                                    {previewUrl && (
                                        <div className="mt-3">
                                            <p className="text-sm text-slate-600 mb-2">
                                                Preview:
                                            </p>
                                            <Image
                                                src={previewUrl}
                                                alt="Preview"
                                                width={120}
                                                height={120}
                                                className="rounded-xl object-cover border border-slate-200 shadow-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {errors.photo && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.photo.message}
                                </p>
                            )}
                        </div>

                        {/* Is Active */}
                        <div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    {...register("isActive")}
                                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
                                />
                                <label
                                    htmlFor="isActive"
                                    className="ml-2 block text-sm text-slate-700 font-medium"
                                >
                                    Aktifkan halaman linktree
                                </label>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">
                                Jika dicentang, halaman linktree akan dapat
                                diakses publik
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
                                {isLoading
                                    ? "Menyimpan..."
                                    : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
