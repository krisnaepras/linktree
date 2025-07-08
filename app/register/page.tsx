"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getAppName } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const registerSchema = z
    .object({
        name: z
            .string()
            .min(1, "Nama harus diisi")
            .max(100, "Nama maksimal 100 karakter"),
        email: z.string().email("Email tidak valid"),
        password: z.string().min(6, "Password minimal 6 karakter"),
        confirmPassword: z.string()
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Konfirmasi password tidak cocok",
        path: ["confirmPassword"]
    });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { data: session, status } = useSession();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema)
    });

    // Auto-redirect if user is already authenticated
    useEffect(() => {
        if (status === "loading") return;

        if (session?.user?.role) {
            const role = session.user.role;
            let redirectPath = "/dashboard";

            if (role === "SUPERADMIN") {
                redirectPath = "/superadmin";
            } else if (role === "ADMIN") {
                redirectPath = "/admin";
            } else {
                redirectPath = "/dashboard";
            }

            router.push(redirectPath);
        }
    }, [session, status, router]);

    // Show loading state while checking authentication
    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
                        <p className="text-slate-600">
                            Memeriksa status login...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Don't render register form if user is already authenticated
    if (session?.user) {
        return null;
    }

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password
                })
            });

            if (response.ok) {
                router.push(
                    "/login?message=Akun berhasil dibuat. Silakan login."
                );
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 flex items-center justify-center px-4 py-8">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-6 space-x-2">
                        <img
                            src="/images/logos/logo_linkku.png"
                            alt="Logo Linkku"
                            width={36}
                            height={36}
                            className="w-9 h-9 object-contain"
                        />
                        <span className="text-xl font-bold text-slate-700">
                            {getAppName()}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-teal-600 bg-clip-text text-transparent mb-2">
                        Bergabung dengan Kami
                    </h1>
                    <p className="text-slate-600">
                        Buat akun{" "}
                        <span className="font-semibold text-sky-700">
                            {getAppName()}
                        </span>{" "}
                        Anda
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-semibold text-slate-700 mb-2"
                        >
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            id="name"
                            {...register("name")}
                            placeholder="Masukkan nama lengkap"
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white transition-all duration-300 hover:border-slate-400"
                        />
                        {errors.name && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold text-slate-700 mb-2"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            {...register("email")}
                            placeholder="contoh@email.com"
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white transition-all duration-300 hover:border-slate-400"
                        />
                        {errors.email && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-semibold text-slate-700 mb-2"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            {...register("password")}
                            placeholder="Minimal 6 karakter"
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white transition-all duration-300 hover:border-slate-400"
                        />
                        {errors.password && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-semibold text-slate-700 mb-2"
                        >
                            Konfirmasi Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            {...register("confirmPassword")}
                            placeholder="Ulangi password"
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white transition-all duration-300 hover:border-slate-400"
                        />
                        {errors.confirmPassword && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] mt-6"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                                Mendaftar...
                            </span>
                        ) : (
                            "Daftar Akun"
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-600">
                        Sudah punya akun?{" "}
                        <Link
                            href="/login"
                            className="text-sky-600 hover:text-sky-700 font-semibold transition-colors duration-300"
                        >
                            Masuk di sini
                        </Link>
                    </p>
                </div>

                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 transition-colors duration-300"
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
                                strokeWidth="2"
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    );
}
