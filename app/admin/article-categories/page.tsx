"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminLayout from "@/components/AdminLayout";
import Swal from "sweetalert2";
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    TagIcon,
    EyeIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";

const categorySchema = z.object({
    name: z
        .string()
        .min(1, "Nama kategori harus diisi")
        .max(50, "Nama kategori maksimal 50 karakter"),
    description: z
        .string()
        .max(200, "Deskripsi maksimal 200 karakter")
        .optional(),
    icon: z.string().optional(),
    color: z.string().optional()
});

type CategoryFormData = z.infer<typeof categorySchema>;

type ArticleCategory = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    createdAt: string;
    updatedAt: string;
    _count: {
        articles: number;
    };
};

const colorOptions = [
    { name: "Biru", value: "#3B82F6", preview: "bg-blue-500" },
    { name: "Ungu", value: "#8B5CF6", preview: "bg-purple-500" },
    { name: "Kuning", value: "#F59E0B", preview: "bg-yellow-500" },
    { name: "Hijau", value: "#10B981", preview: "bg-green-500" },
    { name: "Merah", value: "#EF4444", preview: "bg-red-500" },
    { name: "Pink", value: "#EC4899", preview: "bg-pink-500" },
    { name: "Indigo", value: "#6366F1", preview: "bg-indigo-500" },
    { name: "Teal", value: "#14B8A6", preview: "bg-teal-500" }
];

export default function ArticleCategoriesPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [categories, setCategories] = useState<ArticleCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] =
        useState<ArticleCategory | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        watch,
        setValue
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema)
    });

    const watchedColor = watch("color");

    // Fetch categories
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/article-categories");
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            } else {
                throw new Error("Failed to fetch categories");
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            Swal.fire({
                title: "Error",
                text: "Gagal mengambil data kategori",
                icon: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Handle create/edit category
    const onSubmit = async (data: CategoryFormData) => {
        setIsSubmitting(true);

        try {
            const method = editingCategory ? "PUT" : "POST";
            const url = editingCategory
                ? `/api/admin/article-categories/${editingCategory.id}`
                : "/api/admin/article-categories";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                await Swal.fire({
                    title: "Berhasil",
                    text: editingCategory
                        ? "Kategori berhasil diperbarui"
                        : "Kategori berhasil dibuat",
                    icon: "success"
                });

                setShowModal(false);
                setEditingCategory(null);
                reset();
                fetchCategories();
            } else {
                const error = await response.json();
                throw new Error(error.error || "Gagal menyimpan kategori");
            }
        } catch (error: any) {
            console.error("Error saving category:", error);
            Swal.fire({
                title: "Error",
                text: error.message || "Gagal menyimpan kategori",
                icon: "error"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete category
    const handleDelete = async (category: ArticleCategory) => {
        if (category._count.articles > 0) {
            Swal.fire({
                title: "Tidak dapat menghapus",
                text: `Kategori "${category.name}" masih memiliki ${category._count.articles} artikel. Hapus artikel terlebih dahulu.`,
                icon: "warning"
            });
            return;
        }

        const result = await Swal.fire({
            title: "Hapus Kategori",
            text: `Apakah Anda yakin ingin menghapus kategori "${category.name}"?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            confirmButtonColor: "#EF4444"
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(
                    `/api/admin/article-categories/${category.id}`,
                    {
                        method: "DELETE"
                    }
                );

                if (response.ok) {
                    await Swal.fire({
                        title: "Berhasil",
                        text: "Kategori berhasil dihapus",
                        icon: "success"
                    });
                    fetchCategories();
                } else {
                    const error = await response.json();
                    throw new Error(error.error || "Gagal menghapus kategori");
                }
            } catch (error: any) {
                console.error("Error deleting category:", error);
                Swal.fire({
                    title: "Error",
                    text: error.message || "Gagal menghapus kategori",
                    icon: "error"
                });
            }
        }
    };

    // Handle edit category
    const handleEdit = (category: ArticleCategory) => {
        setEditingCategory(category);
        reset({
            name: category.name,
            description: category.description || "",
            icon: category.icon || "",
            color: category.color || ""
        });
        setShowModal(true);
    };

    // Handle create new category
    const handleCreate = () => {
        setEditingCategory(null);
        reset({
            name: "",
            description: "",
            icon: "",
            color: ""
        });
        setShowModal(true);
    };

    if (!session?.user) {
        router.push("/auth/signin");
        return null;
    }

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Kelola Kategori Artikel
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Kelola kategori untuk mengorganisir artikel
                        </p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Tambah Kategori
                    </button>
                </div>

                {/* Categories List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">
                                Memuat kategori...
                            </p>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="p-8 text-center">
                            <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">
                                Belum ada kategori artikel
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Kategori
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Deskripsi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Artikel
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Dibuat
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {categories.map((category) => (
                                        <tr
                                            key={category.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-4 h-4 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    category.color ||
                                                                    "#6B7280"
                                                            }}
                                                        />
                                                        <span className="text-xl">
                                                            {category.icon ||
                                                                "📂"}
                                                        </span>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {category.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {category.slug}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                                    {category.description ||
                                                        "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {category._count.articles}{" "}
                                                    artikel
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(
                                                    category.createdAt
                                                ).toLocaleDateString("id-ID")}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(category)
                                                        }
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                        title="Edit kategori"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                category
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-900 p-1 rounded"
                                                        title="Hapus kategori"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal for Create/Edit Category */}
                {showModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {editingCategory
                                                ? "Edit Kategori"
                                                : "Tambah Kategori"}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nama Kategori *
                                        </label>
                                        <input
                                            type="text"
                                            {...register("name")}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                            placeholder="Masukkan nama kategori"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.name.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Deskripsi
                                        </label>
                                        <textarea
                                            {...register("description")}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                            placeholder="Masukkan deskripsi kategori"
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.description.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Icon (Emoji)
                                        </label>
                                        <input
                                            type="text"
                                            {...register("icon")}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                            placeholder="Contoh: 💼, 💻, 📰"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Warna
                                        </label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {colorOptions.map((color) => (
                                                <button
                                                    key={color.value}
                                                    type="button"
                                                    onClick={() =>
                                                        setValue(
                                                            "color",
                                                            color.value
                                                        )
                                                    }
                                                    className={`h-10 w-full rounded-lg border-2 transition-all ${
                                                        watchedColor ===
                                                        color.value
                                                            ? "border-gray-900 ring-2 ring-gray-900 ring-offset-2"
                                                            : "border-gray-300 hover:border-gray-400"
                                                    } ${color.preview}`}
                                                    title={color.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {isSubmitting
                                            ? "Menyimpan..."
                                            : editingCategory
                                            ? "Perbarui"
                                            : "Simpan"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
