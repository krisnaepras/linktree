"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminLayout from "@/components/AdminLayout";
import RichTextEditor from "@/components/RichTextEditor";
import Swal from "sweetalert2";
import Image from "next/image";

const articleSchema = z.object({
    title: z
        .string()
        .min(1, "Judul artikel harus diisi")
        .max(200, "Judul artikel maksimal 200 karakter"),
    content: z.string().min(1, "Konten artikel harus diisi"),
    excerpt: z.string().optional(),
    featuredImage: z.string().url().optional().or(z.literal("")),
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

type Article = {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    featuredImage: string | null;
    categoryId: string | null;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    metaTitle: string | null;
    metaDescription: string | null;
    tags: string[];
    isFeatured: boolean;
    viewCount: number;
    readingTime: number | null;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    author: {
        id: string;
        name: string;
        email: string;
    };
    category: {
        id: string;
        name: string;
        slug: string;
        icon: string | null;
        color: string | null;
    } | null;
};

type Props = {
    params: Promise<{ id: string }>;
};

export default function EditArticlePage({ params }: Props) {
    const { id } = use(params);
    const { data: session } = useSession();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState<ArticleCategory[]>([]);
    const [content, setContent] = useState("");
    const [previewMode, setPreviewMode] = useState(false);
    const [article, setArticle] = useState<Article | null>(null);
    const [hasLocalChanges, setHasLocalChanges] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset
    } = useForm<ArticleFormData>({
        resolver: zodResolver(articleSchema),
        defaultValues: {
            status: "DRAFT",
            isFeatured: false
        }
    });

    // Check authentication and role
    useEffect(() => {
        if (!session) {
            router.push("/auth/login");
            return;
        }

        if (
            session.user.role !== "ADMIN" &&
            session.user.role !== "SUPERADMIN"
        ) {
            router.push("/dashboard");
            return;
        }
    }, [session, router]);

    // Load local changes from localStorage
    useEffect(() => {
        if (id) {
            const savedContent = localStorage.getItem(`article-content-${id}`);
            if (savedContent) {
                setContent(savedContent);
                setHasLocalChanges(true);
                console.log("📥 Loaded content from localStorage");
            }
        }
    }, [id]);

    // Fetch article data
    useEffect(() => {
        const fetchArticle = async () => {
            try {
                console.log("Fetching article with ID:", id);
                const response = await fetch(`/api/admin/articles/${id}`);
                console.log("Response status:", response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("API Error:", errorText);
                    throw new Error(
                        `Failed to fetch article: ${response.status}`
                    );
                }

                const data = await response.json();
                console.log("Article data:", data);
                setArticle(data);

                // If no local changes, use server content
                const savedContent = localStorage.getItem(
                    `article-content-${id}`
                );
                if (!savedContent) {
                    setContent(data.content);
                }

                // Populate form
                reset({
                    title: data.title,
                    content: savedContent || data.content,
                    excerpt: data.excerpt || "",
                    featuredImage: data.featuredImage || "",
                    categoryId: data.categoryId || "",
                    status: data.status,
                    metaTitle: data.metaTitle || "",
                    metaDescription: data.metaDescription || "",
                    tags: data.tags.join(", "),
                    isFeatured: data.isFeatured
                });
            } catch (error) {
                console.error("Error fetching article:", error);
                Swal.fire({
                    title: "Error",
                    text: "Gagal memuat artikel. Silakan coba lagi atau hubungi admin.",
                    icon: "error"
                });
                router.push("/admin/articles");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchArticle();
        }
    }, [id, reset, router]);

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

    // Handle content change - save to localStorage only
    const handleContentChange = (newContent: string) => {
        console.log(
            "💾 Saving content to localStorage:",
            newContent.length,
            "characters"
        );
        setContent(newContent);
        localStorage.setItem(`article-content-${id}`, newContent);
        setHasLocalChanges(true);
    };

    // Update form content value for validation
    useEffect(() => {
        setValue("content", content);
    }, [content, setValue]);

    // Submit function - save to server
    const onSubmit = async (data: ArticleFormData) => {
        console.log("🚀 Submitting to server...");
        try {
            setIsSubmitting(true);

            // Process tags
            const tags = data.tags
                ? data.tags
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                : [];

            const payload = {
                ...data,
                tags,
                content, // Use content from state (which includes local changes)
                featuredImage: data.featuredImage || null,
                categoryId: data.categoryId || null,
                excerpt: data.excerpt || null,
                metaTitle: data.metaTitle || null,
                metaDescription: data.metaDescription || null
            };

            const response = await fetch(`/api/admin/articles/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error("Failed to update article");
            }

            // Clear localStorage after successful save
            localStorage.removeItem(`article-content-${id}`);
            setHasLocalChanges(false);

            await Swal.fire({
                title: "Berhasil!",
                text: "Artikel berhasil diperbarui",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });

            router.push("/admin/articles");
        } catch (error) {
            console.error("Error updating article:", error);
            Swal.fire({
                title: "Error",
                text: "Gagal memperbarui artikel",
                icon: "error"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    if (!article) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Artikel tidak ditemukan
                    </h1>
                    <button
                        onClick={() => router.push("/admin/articles")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Kembali ke Daftar Artikel
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Edit Artikel
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Edit artikel: {article.title}
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => setPreviewMode(!previewMode)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                {previewMode ? "Edit" : "Preview"}
                            </button>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Title */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Judul Artikel *
                                </label>
                                <input
                                    type="text"
                                    {...register("title")}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    placeholder="Masukkan judul artikel"
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.title.message}
                                    </p>
                                )}
                            </div>

                            {/* Excerpt */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ringkasan
                                </label>
                                <textarea
                                    {...register("excerpt")}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    placeholder="Ringkasan singkat artikel (opsional)"
                                />
                                {errors.excerpt && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.excerpt.message}
                                    </p>
                                )}
                            </div>

                            {/* Content */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Konten Artikel *
                                </label>
                                {hasLocalChanges && (
                                    <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                                            <span className="text-sm text-yellow-800">
                                                💾 Perubahan tersimpan lokal -
                                                Klik "Perbarui Artikel" untuk
                                                menyimpan ke server
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {previewMode ? (
                                    <div className="border border-gray-300 rounded-lg p-4 min-h-[400px] bg-gray-50">
                                        <div
                                            className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: content
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <RichTextEditor
                                        content={content}
                                        onChange={handleContentChange}
                                        placeholder="Tulis konten artikel di sini..."
                                    />
                                )}
                                {errors.content && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.content.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Status */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Status Publikasi
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            {...register("status")}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        >
                                            <option value="DRAFT">Draft</option>
                                            <option value="PUBLISHED">
                                                Published
                                            </option>
                                            <option value="ARCHIVED">
                                                Archived
                                            </option>
                                        </select>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            {...register("isFeatured")}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-700">
                                            Artikel unggulan
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Category */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Kategori
                                </h3>
                                <select
                                    {...register("categoryId")}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                >
                                    <option value="">Pilih kategori</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Featured Image */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Gambar Unggulan
                                </h3>
                                <input
                                    type="url"
                                    {...register("featuredImage")}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    placeholder="URL gambar unggulan"
                                />
                                {watch("featuredImage") && (
                                    <div className="mt-3">
                                        <Image
                                            src={watch("featuredImage")!}
                                            alt="Preview"
                                            width={200}
                                            height={120}
                                            className="rounded-lg object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display =
                                                    "none";
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSubmitting
                                        ? "Menyimpan..."
                                        : "Perbarui Artikel"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
