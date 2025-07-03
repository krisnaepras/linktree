"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const profileSchema = z
    .object({
        name: z
            .string()
            .min(2, "Nama minimal 2 karakter")
            .max(100, "Nama maksimal 100 karakter"),
        email: z.string().email("Email tidak valid"),
        currentPassword: z.string().optional(),
        newPassword: z.string().optional(),
        confirmPassword: z.string().optional()
    })
    .refine(
        (data) => {
            if (data.newPassword && data.newPassword.length < 6) {
                return false;
            }
            return true;
        },
        {
            message: "Password baru minimal 6 karakter",
            path: ["newPassword"]
        }
    )
    .refine(
        (data) => {
            if (data.newPassword && data.newPassword !== data.confirmPassword) {
                return false;
            }
            return true;
        },
        {
            message: "Konfirmasi password tidak cocok",
            path: ["confirmPassword"]
        }
    );

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema)
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated" && session?.user) {
            reset({
                name: session.user.name || "",
                email: session.user.email || "",
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        }
    }, [status, router, session, reset]);

    const onSubmit = async (data: ProfileFormData) => {
        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const updateData: any = {
                name: data.name,
                email: data.email
            };

            // Only include password fields if user wants to change password
            if (data.newPassword && data.currentPassword) {
                updateData.currentPassword = data.currentPassword;
                updateData.newPassword = data.newPassword;
            }

            const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                setSuccessMessage("Profil berhasil diperbarui!");

                // Reset password fields
                reset({
                    name: data.name,
                    email: data.email,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
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
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                ← Kembali ke Dashboard
                            </Link>
                            <h1 className="text-xl font-semibold text-gray-900">
                                Profil Pengguna
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
                            Kelola Profil Anda
                        </h2>
                        <p className="text-gray-600">
                            Perbarui informasi profil dan kata sandi Anda
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                            {successMessage}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        {/* Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Nama Lengkap *
                            </label>
                            <input
                                type="text"
                                id="name"
                                {...register("name")}
                                placeholder="Masukkan nama lengkap Anda"
                                className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email *
                            </label>
                            <input
                                type="email"
                                id="email"
                                {...register("email")}
                                placeholder="Masukkan email Anda"
                                className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.email.message}
                                </p>
                            )}
                            <p className="mt-1 text-sm text-gray-500">
                                Email digunakan untuk login ke akun Anda
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 my-6"></div>

                        {/* Password Section */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Ubah Kata Sandi
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Kosongkan jika tidak ingin mengubah kata sandi
                            </p>
                        </div>

                        {/* Current Password */}
                        <div>
                            <label
                                htmlFor="currentPassword"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Kata Sandi Saat Ini
                            </label>
                            <input
                                type="password"
                                id="currentPassword"
                                {...register("currentPassword")}
                                placeholder="Masukkan kata sandi saat ini"
                                className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                            />
                            {errors.currentPassword && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.currentPassword.message}
                                </p>
                            )}
                        </div>

                        {/* New Password */}
                        <div>
                            <label
                                htmlFor="newPassword"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Kata Sandi Baru
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                {...register("newPassword")}
                                placeholder="Masukkan kata sandi baru"
                                className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                            />
                            {errors.newPassword && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.newPassword.message}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Konfirmasi Kata Sandi Baru
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                {...register("confirmPassword")}
                                placeholder="Ulangi kata sandi baru"
                                className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
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
