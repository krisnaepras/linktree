"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";

const createLinktreeSchema = z.object({
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
    isActive: z.boolean().optional()
});

type CreateLinktreeFormData = z.infer<typeof createLinktreeSchema>;

export default function CreateLinktreePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [photoMethod, setPhotoMethod] = useState<"url" | "upload">("url");

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue
    } = useForm<CreateLinktreeFormData>({
        resolver: zodResolver(createLinktreeSchema),
        defaultValues: {
            isActive: true
        }
    });

    const titleValue = watch("title");

    // Auto-generate slug from title
    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        const slug = generateSlug(title);
        setValue("slug", slug);
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

    const onSubmit = async (data: CreateLinktreeFormData) => {
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
                method: "POST",
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

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        router.push("/login");
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
                                Buat Linktree Baru
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
                            Buat Linktree UMKM Anda
                        </h2>
                        <p className="text-gray-600">
                            Isi informasi dasar untuk halaman linktree UMKM Anda
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
                                Judul Linktree *
                            </label>
                            <input
                                type="text"
                                id="title"
                                {...register("title")}
                                onChange={(e) => {
                                    register("title").onChange(e);
                                    handleTitleChange(e);
                                }}
                                placeholder="Contoh: Warung Makan Ibu Sari"
                                className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
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
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                URL Slug *
                            </label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg">
                                    linkumkm.com/
                                </span>
                                <input
                                    type="text"
                                    id="slug"
                                    {...register("slug")}
                                    placeholder="warung-makan-ibu-sari"
                                    className="flex-1 px-3 py-2 border border-gray-400 rounded-r-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                                />
                            </div>
                            {errors.slug && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.slug.message}
                                </p>
                            )}
                            <p className="mt-1 text-sm text-gray-500">
                                URL unik untuk halaman linktree Anda
                            </p>
                        </div>

                        {/* Photo URL */}
                        {/* Photo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                        className="mr-2"
                                    />
                                    URL Gambar
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
                                        className="mr-2"
                                    />
                                    Upload File
                                </label>
                            </div>

                            {photoMethod === "url" ? (
                                <div>
                                    <input
                                        type="url"
                                        id="photo"
                                        {...register("photo")}
                                        placeholder="https://example.com/foto-umkm.jpg"
                                        className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
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
                                        className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Format: JPG, PNG, GIF, WebP. Maksimal
                                        2MB
                                    </p>

                                    {/* Preview */}
                                    {previewUrl && (
                                        <div className="mt-3">
                                            <p className="text-sm text-gray-600 mb-2">
                                                Preview:
                                            </p>
                                            <Image
                                                src={previewUrl}
                                                alt="Preview"
                                                width={120}
                                                height={120}
                                                className="rounded-full object-cover border-4 border-white shadow-lg"
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
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="isActive"
                                    className="ml-2 block text-sm text-gray-700"
                                >
                                    Aktifkan halaman linktree setelah dibuat
                                </label>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                Jika dicentang, halaman linktree akan langsung
                                dapat diakses publik
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4">
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
                                {isLoading ? "Membuat..." : "Buat Linktree"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
