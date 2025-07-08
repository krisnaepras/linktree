"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getAppName } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email("Email tidak valid"),
    password: z.string().min(1, "Password harus diisi")
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
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

    useEffect(() => {
        // Check if there's a success message from registration
        const message = searchParams.get("message");
        if (message) {
            setSuccessMessage(message);
        }
    }, [searchParams]);

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false
            });

            if (result?.error) {
                setError("Email atau password salah");
            } else {
                // Check session to get user data and redirect based on role
                const session = await getSession();
                if (session?.user?.role) {
                    const role = session.user.role;
                    if (role === "SUPERADMIN") {
                        router.push("/superadmin");
                    } else if (role === "ADMIN") {
                        router.push("/admin");
                    } else {
                        router.push("/dashboard");
                    }
                } else {
                    router.push("/dashboard");
                }
            }
        } catch (error) {
            setError("Terjadi kesalahan pada server");
        } finally {
            setIsLoading(false);
        }
    };

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

    // Don't render login form if user is already authenticated
    if (session?.user) {
        return null;
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 flex items-center justify-center px-4">
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
                        Selamat Datang Kembali
                    </h1>
                    <p className="text-slate-600">
                        Masuk ke akun <span className="font-semibold text-sky-700">{getAppName()}</span> Anda
                    </p>
                </div>

                {successMessage && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl">
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold text-slate-700 mb-3"
                        >
                            Email
                        </label>
                        <input
                            {...register("email")}
                            type="email"
                            id="email"
                            className="w-full px-4 py-4 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white transition-all duration-300 hover:border-slate-400"
                            placeholder="nama@email.com"
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
                            className="block text-sm font-semibold text-slate-700 mb-3"
                        >
                            Password
                        </label>
                        <input
                            {...register("password")}
                            type="password"
                            id="password"
                            className="w-full px-4 py-4 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white transition-all duration-300 hover:border-slate-400"
                            placeholder="Password Anda"
                        />
                        {errors.password && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
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
                                Masuk...
                            </span>
                        ) : (
                            "Masuk"
                        )}
                    </button>
                </form>

                <div className="text-center mt-8">
                    <p className="text-slate-600">
                        Belum punya akun?{" "}
                        <Link
                            href="/register"
                            className="text-sky-600 hover:text-sky-700 font-semibold transition-colors duration-300"
                        >
                            Daftar sekarang
                        </Link>
                    </p>
                </div>

                <div className="text-center mt-6">
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
                        Kembali ke beranda
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
