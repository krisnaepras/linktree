"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email("Email tidak valid"),
    password: z.string().min(1, "Password harus diisi")
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    });

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
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Masuk
                    </h1>
                    <p className="text-gray-600">
                        Masuk ke akun LinkUMKM Bongkaran Anda
                    </p>
                </div>

                {successMessage && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Email
                        </label>
                        <input
                            {...register("email")}
                            type="email"
                            id="email"
                            className="w-full px-4 py-3 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors"
                            placeholder="nama@email.com"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Password
                        </label>
                        <input
                            {...register("password")}
                            type="password"
                            id="password"
                            className="w-full px-4 py-3 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors"
                            placeholder="Password Anda"
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Masuk..." : "Masuk"}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-gray-600">
                        Belum punya akun?{" "}
                        <Link
                            href="/register"
                            className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                            Daftar sekarang
                        </Link>
                    </p>
                </div>

                <div className="text-center mt-6">
                    <Link
                        href="/"
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        ← Kembali ke beranda
                    </Link>
                </div>
            </div>
        </div>
    );
}
