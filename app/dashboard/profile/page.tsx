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
                                Kembali ke Dashboard
                            </Link>
                            <h1 className="text-xl font-semibold text-slate-800">
                                Profil Pengguna
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
                            Kelola Profil Anda
                        </h2>
                        <p className="text-slate-600">
                            Perbarui informasi profil dan kata sandi Anda
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl">
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
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Nama Lengkap *
                            </label>
                            <input
                                type="text"
                                id="name"
                                {...register("name")}
                                placeholder="Masukkan nama lengkap Anda"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Email *
                            </label>
                            <input
                                type="email"
                                id="email"
                                {...register("email")}
                                placeholder="Masukkan email Anda"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.email.message}
                                </p>
                            )}
                            <p className="mt-1 text-sm text-slate-500">
                                Email digunakan untuk login ke akun Anda
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-200 my-6"></div>

                        {/* Password Section */}
                        <div>
                            <h3 className="text-lg font-medium text-slate-800 mb-4">
                                Ubah Kata Sandi
                            </h3>
                            <p className="text-sm text-slate-600 mb-4">
                                Kosongkan jika tidak ingin mengubah kata sandi
                            </p>
                        </div>

                        {/* Current Password */}
                        <div>
                            <label
                                htmlFor="currentPassword"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Kata Sandi Saat Ini
                            </label>
                            <input
                                type="password"
                                id="currentPassword"
                                {...register("currentPassword")}
                                placeholder="Masukkan kata sandi saat ini"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Kata Sandi Baru
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                {...register("newPassword")}
                                placeholder="Masukkan kata sandi baru"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Konfirmasi Kata Sandi Baru
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                {...register("confirmPassword")}
                                placeholder="Ulangi kata sandi baru"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
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
