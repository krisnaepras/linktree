"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminLayout from "@/components/AdminLayout";
import RichTextEditor from "@/components/RichTextEditor";
import UploadImage from "@/components/UploadImage";
import Swal from "sweetalert2";
import Image from "next/image";

const articleSchema = z.object({
    title: z
        .string()
        .min(1, "Judul artikel harus diisi")
        .max(200, "Judul artikel maksimal 200 karakter"),
    content: z.string().min(1, "Konten artikel harus diisi"),
    excerpt: z.string().optional(),
    featuredImage: z
        .string()
        .optional()
        .refine((val) => {
            if (!val || val === "") return true;
            // Allow both full URLs and relative paths
            return /^(https?:\/\/|\/)/i.test(val);
        }, "URL gambar tidak valid"),
    categoryId: z.string().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    tags: z.string().optional(),
    isFeatured: z.boolean()
});

type ArticleFormData = z.infer<typeof articleSchema>;

type ArticleCategory = {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
};

export default function CreateArticlePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<ArticleCategory[]>([]);
    const [content, setContent] = useState("");
    const [previewMode, setPreviewMode] = useState(false);
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm<ArticleFormData>({
        resolver: zodResolver(articleSchema),
        defaultValues: {
            status: "DRAFT",
            isFeatured: false
        }
    });

    const watchedTitle = watch("title");
    const watchedContent = watch("content");
    const watchedFeaturedImage = watch("featuredImage");

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                console.log("Fetching categories...");
                const response = await fetch("/api/admin/article-categories");
                console.log("Response status:", response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log("Categories data:", data);
                    setCategories(data);
                } else {
                    console.error(
                        "Failed to fetch categories:",
                        response.statusText
                    );
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    // Handle content change from editor - NO AUTO SAVE
    const handleContentChange = (newContent: string) => {
        console.log(
            "Content changed, but NOT auto-saving:",
            newContent.length,
            "characters"
        );
        setContent(newContent);
    };

    // Update form content value for validation (but no auto-save)
    useEffect(() => {
        setValue("content", content);
    }, [content, setValue]);

    const onSubmit = async (data: ArticleFormData) => {
        if (!content.trim()) {
            Swal.fire({
                title: "Error",
                text: "Konten artikel harus diisi",
                icon: "error"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Process tags
            const tagsArray = data.tags
                ? data.tags
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                : [];

            const payload = {
                ...data,
                content,
                tags: tagsArray
            };

            const response = await fetch("/api/admin/articles", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                Swal.fire({
                    title: "Berhasil!",
                    text: "Artikel berhasil dibuat",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                });
                router.push("/admin/articles");
            } else {
                const error = await response.json();
                throw new Error(error.error || "Gagal membuat artikel");
            }
        } catch (error) {
            console.error("Error creating article:", error);
            Swal.fire({
                title: "Error",
                text:
                    error instanceof Error
                        ? error.message
                        : "Gagal membuat artikel",
                icon: "error"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveDraft = () => {
        setValue("status", "DRAFT");
        handleSubmit(onSubmit)();
    };

    const handlePublish = () => {
        setValue("status", "PUBLISHED");
        handleSubmit(onSubmit)();
    };

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Buat Artikel Baru
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Tulis artikel untuk platform LinkUMKM
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => setPreviewMode(!previewMode)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {previewMode ? "Edit" : "Preview"}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            {/* Title */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Judul Artikel *
                                    </label>
                                    <input
                                        type="text"
                                        {...register("title")}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-gray-900"
                                        placeholder="Masukkan judul artikel..."
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.title.message}
                                        </p>
                                    )}
                                </div>

                                {/* Excerpt */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ringkasan (Opsional)
                                    </label>
                                    <textarea
                                        {...register("excerpt")}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="Ringkasan singkat artikel (akan otomatis dibuat jika kosong)"
                                    />
                                    {errors.excerpt && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.excerpt.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Content Editor */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                    Konten Artikel *
                                </label>
                                {previewMode ? (
                                    <div className="min-h-[400px] p-4 border border-gray-300 rounded-lg">
                                        <div
                                            className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none prose-gray prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800 prose-a:text-blue-600 prose-blockquote:text-gray-700"
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    content ||
                                                    "<p>Belum ada konten...</p>"
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <RichTextEditor
                                        content={content}
                                        onChange={handleContentChange}
                                        placeholder="Mulai menulis artikel Anda di sini..."
                                    />
                                )}
                                {errors.content && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.content.message}
                                    </p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={handleSaveDraft}
                                        disabled={isSubmitting}
                                        className="inline-flex items-center px-6 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting
                                            ? "Menyimpan..."
                                            : "Simpan Draft"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handlePublish}
                                        disabled={isSubmitting}
                                        className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting
                                            ? "Mempublikasi..."
                                            : "Publikasikan"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Featured Image */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <UploadImage
                                value={watchedFeaturedImage}
                                onChange={(url) =>
                                    setValue("featuredImage", url)
                                }
                                onError={setUploadError}
                                label="Gambar Unggulan"
                                placeholder="https://example.com/image.jpg"
                            />
                            {errors.featuredImage && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.featuredImage.message}
                                </p>
                            )}
                            {uploadError && (
                                <p className="text-red-500 text-sm mt-1">
                                    {uploadError}
                                </p>
                            )}
                        </div>

                        {/* Category */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Kategori
                            </h3>
                            <select
                                {...register("categoryId")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.length > 0 ? (
                                    categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.icon
                                                ? `${category.icon} `
                                                : ""}
                                            {category.name}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>Loading...</option>
                                )}
                            </select>
                            {categories.length === 0 && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Memuat kategori...
                                </p>
                            )}
                        </div>

                        {/* Tags */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Tags
                            </h3>
                            <div>
                                <input
                                    type="text"
                                    {...register("tags")}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    placeholder="umkm, bisnis, tips (pisahkan dengan koma)"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Pisahkan tag dengan koma
                                </p>
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Pengaturan
                            </h3>
                            <div className="space-y-4">
                                {/* Featured */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        {...register("isFeatured")}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 block text-sm text-gray-900">
                                        Artikel Unggulan
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* SEO */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                SEO
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Meta Title
                                    </label>
                                    <input
                                        type="text"
                                        {...register("metaTitle")}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="Akan menggunakan judul artikel jika kosong"
                                    />
                                    {errors.metaTitle && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.metaTitle.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Meta Description
                                    </label>
                                    <textarea
                                        {...register("metaDescription")}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="Akan menggunakan ringkasan jika kosong"
                                    />
                                    {errors.metaDescription && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.metaDescription.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
