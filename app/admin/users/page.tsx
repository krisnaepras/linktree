"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminLayout from "@/components/AdminLayout";
import Swal from "sweetalert2";

const userSchema = z.object({
    name: z
        .string()
        .min(1, "Nama harus diisi")
        .max(100, "Nama maksimal 100 karakter"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter").optional(),
    role: z.enum(["USER", "ADMIN"])
});

type UserFormData = z.infer<typeof userSchema>;

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    _count: {
        linktrees: number;
    };
};

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: UserFormData) => Promise<void>;
    user?: User | null;
    isLoading?: boolean;
    canEditRole: boolean;
}

interface UserDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    isLoading?: boolean;
}

function UserModal({
    isOpen,
    onClose,
    onSave,
    user,
    isLoading,
    canEditRole
}: UserModalProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            role: (user?.role as "USER" | "ADMIN") || "USER"
        }
    });

    useEffect(() => {
        if (user) {
            reset({
                name: user.name,
                email: user.email,
                role: user.role as "USER" | "ADMIN"
            });
        } else {
            reset({
                name: "",
                email: "",
                role: "USER"
            });
        }
    }, [user, reset]);

    const onSubmit = async (data: UserFormData) => {
        // Remove password from data if editing and password is empty
        if (user && !data.password) {
            const { password, ...dataWithoutPassword } = data;
            await onSave(dataWithoutPassword as UserFormData);
        } else {
            await onSave(data);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto transform animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {user ? "Edit User" : "Tambah User"}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {user
                                ? "Perbarui informasi user"
                                : "Buat akun user baru"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="p-6 space-y-5"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nama Lengkap *
                        </label>
                        <input
                            type="text"
                            {...register("name")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Masukkan nama lengkap"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            {...register("email")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="user@example.com"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password{" "}
                            {user
                                ? "(Kosongkan jika tidak ingin mengubah)"
                                : "*"}
                        </label>
                        <input
                            type="password"
                            {...register("password")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={
                                user
                                    ? "Biarkan kosong jika tidak ingin mengubah"
                                    : "Minimal 6 karakter"
                            }
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {canEditRole && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role *
                            </label>
                            <select
                                {...register("role")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                            {errors.role && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.role.message}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Menyimpan...
                                </span>
                            ) : user ? (
                                "Perbarui"
                            ) : (
                                "Tambah"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function UserDetailModal({
    isOpen,
    onClose,
    user,
    isLoading
}: UserDetailModalProps) {
    if (!isOpen) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Detail User
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : user ? (
                        <div className="space-y-6">
                            {/* User Avatar & Basic Info */}
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-gray-600">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {user.name}
                                </h2>
                                <p className="text-gray-600">{user.email}</p>
                                <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                                        user.role === "SUPERADMIN"
                                            ? "bg-purple-100 text-purple-800"
                                            : user.role === "ADMIN"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-green-100 text-green-800"
                                    }`}
                                >
                                    {user.role === "SUPERADMIN"
                                        ? "Super Admin"
                                        : user.role === "ADMIN"
                                        ? "Admin"
                                        : "User"}
                                </span>
                            </div>

                            {/* User Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">
                                        Informasi Akun
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                ID User:
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {user.id}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Role:
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {user.role}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Status:
                                            </span>
                                            <span className="text-sm font-medium text-green-600">
                                                Aktif
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">
                                        Aktivitas
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Total Linktrees:
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {user._count.linktrees}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Bergabung:
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatDate(user.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Terakhir Update:
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatDate(user.updatedAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Statistics */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-3">
                                    Statistik
                                </h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {user._count.linktrees}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Linktrees
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {Math.floor(
                                                (Date.now() -
                                                    new Date(
                                                        user.createdAt
                                                    ).getTime()) /
                                                    (1000 * 60 * 60 * 24)
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Hari Bergabung
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {user._count.linktrees > 0
                                                ? "Aktif"
                                                : "Pasif"}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Status Aktivitas
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">
                                Data user tidak ditemukan.
                            </p>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminUsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailUser, setDetailUser] = useState<User | null>(null);

    // Pagination and Sorting
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [sortBy, setSortBy] = useState<
        "name" | "email" | "role" | "createdAt" | "linktrees"
    >("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const isAdmin = session?.user?.role === "ADMIN";
    const isSuperAdmin = session?.user?.role === "SUPERADMIN";

    useEffect(() => {
        if (session) {
            fetchUsers();
        }
    }, [session]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/users");

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch users");
            }
        } catch (error) {
            Swal.fire({
                title: "Error",
                text:
                    error instanceof Error
                        ? error.message
                        : "Gagal memuat data users",
                icon: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveUser = async (data: UserFormData) => {
        setIsSubmitting(true);
        try {
            const url = editingUser
                ? `/api/admin/users/${editingUser.id}`
                : "/api/admin/users";

            const method = editingUser ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                await fetchUsers();
                setIsModalOpen(false);
                setEditingUser(null);

                Swal.fire({
                    title: "Berhasil!",
                    text: `User berhasil ${
                        editingUser ? "diperbarui" : "ditambahkan"
                    }`,
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                const error = await response.json();
                throw new Error(error.error || "Gagal menyimpan user");
            }
        } catch (error) {
            Swal.fire({
                title: "Error",
                text:
                    error instanceof Error
                        ? error.message
                        : "Gagal menyimpan user",
                icon: "error"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateUser = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleViewUserDetail = (user: User) => {
        router.push(`/admin/users/${user.id}`);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setDetailUser(null);
    };

    const handleDeleteUser = async (user: User) => {
        const result = await Swal.fire({
            title: `Hapus ${user.role === "ADMIN" ? "Admin" : "User"}?`,
            text: `Apakah Anda yakin ingin menghapus ${user.name}? Semua data linktree akan ikut terhapus.`,
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
            const response = await fetch(`/api/admin/users/${user.id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                await fetchUsers();
                Swal.fire({
                    title: "Berhasil!",
                    text: `${
                        user.role === "ADMIN" ? "Admin" : "User"
                    } berhasil dihapus`,
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || "Gagal menghapus user");
            }
        } catch (error) {
            Swal.fire({
                title: "Error",
                text:
                    error instanceof Error
                        ? error.message
                        : "Gagal menghapus user",
                icon: "error"
            });
        }
    };

    // Sorting function
    const handleSort = (
        field: "name" | "email" | "role" | "createdAt" | "linktrees"
    ) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("asc");
        }
        setCurrentPage(1); // Reset to first page when sorting
    };

    // Filter and sort users
    const filteredUsers = users
        .filter(
            (user) =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case "name":
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case "email":
                    aValue = a.email.toLowerCase();
                    bValue = b.email.toLowerCase();
                    break;
                case "role":
                    aValue = a.role;
                    bValue = b.role;
                    break;
                case "linktrees":
                    aValue = a._count.linktrees;
                    bValue = b._count.linktrees;
                    break;
                case "createdAt":
                default:
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                    break;
            }

            if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = filteredUsers.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Pagination range
    const getPaginationRange = () => {
        const range = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                range.push(i);
            }
        } else {
            const start = Math.max(1, currentPage - 2);
            const end = Math.min(totalPages, start + maxVisible - 1);

            for (let i = start; i <= end; i++) {
                range.push(i);
            }
        }

        return range;
    };

    const filteredAndSortedUsers = filteredUsers; // Use the filtered and sorted users for display

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-64">
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Kelola {isAdmin ? "Users" : "Users & Admins"}
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                {isAdmin
                                    ? "Kelola dan atur akun pengguna biasa"
                                    : "Kelola semua akun pengguna dan admin platform"}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <svg
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Cari user..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={handleCreateUser}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                                Tambah {isAdmin ? "User" : "User/Admin"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                            Menampilkan{" "}
                            <span className="font-medium text-gray-900">
                                {filteredUsers.length}
                            </span>{" "}
                            dari{" "}
                            <span className="font-medium text-gray-900">
                                {users.length}
                            </span>{" "}
                            pengguna
                        </span>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleSort("name")}
                                            className="flex items-center focus:outline-none"
                                        >
                                            Pengguna
                                            {sortBy === "name" && (
                                                <svg
                                                    className={`ml-2 h-4 w-4 ${
                                                        sortOrder === "asc"
                                                            ? ""
                                                            : "transform rotate-180"
                                                    }`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 15l7-7 7 7"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleSort("role")}
                                            className="flex items-center focus:outline-none"
                                        >
                                            Role
                                            {sortBy === "role" && (
                                                <svg
                                                    className={`ml-2 h-4 w-4 ${
                                                        sortOrder === "asc"
                                                            ? ""
                                                            : "transform rotate-180"
                                                    }`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 15l7-7 7 7"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() =>
                                                handleSort("linktrees")
                                            }
                                            className="flex items-center focus:outline-none"
                                        >
                                            Linktrees
                                            {sortBy === "linktrees" && (
                                                <svg
                                                    className={`ml-2 h-4 w-4 ${
                                                        sortOrder === "asc"
                                                            ? ""
                                                            : "transform rotate-180"
                                                    }`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 15l7-7 7 7"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() =>
                                                handleSort("createdAt")
                                            }
                                            className="flex items-center focus:outline-none"
                                        >
                                            Terdaftar
                                            {sortBy === "createdAt" && (
                                                <svg
                                                    className={`ml-2 h-4 w-4 ${
                                                        sortOrder === "asc"
                                                            ? "transform rotate-180"
                                                            : ""
                                                    }`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <svg
                                                        className="w-5 h-5 text-gray-500"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    user.role === "SUPERADMIN"
                                                        ? "bg-purple-100 text-purple-800"
                                                        : user.role === "ADMIN"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-green-100 text-green-800"
                                                }`}
                                            >
                                                {user.role === "SUPERADMIN"
                                                    ? "Super Admin"
                                                    : user.role === "ADMIN"
                                                    ? "Admin"
                                                    : "User"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-900">
                                                    {user._count.linktrees}
                                                </span>
                                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {user._count.linktrees === 1
                                                        ? "linktree"
                                                        : "linktrees"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleViewUserDetail(
                                                            user
                                                        )
                                                    }
                                                    className="inline-flex items-center px-3 py-1.5 border border-blue-300 shadow-sm text-xs font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    title="Lihat detail user"
                                                >
                                                    <svg
                                                        className="w-4 h-4 mr-1"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                        />
                                                    </svg>
                                                    Detail
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleEditUser(user)
                                                    }
                                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    title="Edit user"
                                                >
                                                    <svg
                                                        className="w-4 h-4 mr-1"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        />
                                                    </svg>
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteUser(user)
                                                    }
                                                    className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                    title="Hapus user"
                                                >
                                                    <svg
                                                        className="w-4 h-4 mr-1"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Halaman{" "}
                        <span className="font-medium text-gray-900">
                            {currentPage}
                        </span>{" "}
                        dari{" "}
                        <span className="font-medium text-gray-900">
                            {totalPages}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="inline-flex items-center justify-center w-8 h-8 text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Sebelumnya"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 18l-6-6 6-6"
                                />
                            </svg>
                        </button>
                        {getPaginationRange().map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none ${
                                    page === currentPage
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center justify-center w-8 h-8 text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Selanjutnya"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 6l6 6-6 6"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Empty State */}
                {filteredUsers.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="text-center py-16">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">
                                {searchTerm
                                    ? "Tidak ada user ditemukan"
                                    : "Belum ada user"}
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                                {searchTerm
                                    ? `Tidak ada user yang cocok dengan pencarian "${searchTerm}".`
                                    : "Mulai dengan menambahkan user pertama untuk platform ini."}
                            </p>
                            {!searchTerm && (
                                <div className="mt-6">
                                    <button
                                        onClick={handleCreateUser}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                            />
                                        </svg>
                                        Tambah User Pertama
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {/* Modal */}{" "}
            <UserModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                }}
                onSave={handleSaveUser}
                user={editingUser}
                isLoading={isSubmitting}
                canEditRole={isSuperAdmin}
            />
            <UserDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                user={detailUser}
            />
        </AdminLayout>
    );
}
