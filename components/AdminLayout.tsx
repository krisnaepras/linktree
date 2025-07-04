"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { signOut } from "next-auth/react";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar
    const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] =
        useState(false); // Desktop sidebar

    // Load sidebar state from localStorage on component mount
    useEffect(() => {
        const savedState = localStorage.getItem("adminSidebarCollapsed");
        if (savedState !== null) {
            setDesktopSidebarCollapsed(JSON.parse(savedState));
        }
    }, []);

    // Save sidebar state to localStorage when it changes
    useEffect(() => {
        localStorage.setItem(
            "adminSidebarCollapsed",
            JSON.stringify(desktopSidebarCollapsed)
        );
    }, [desktopSidebarCollapsed]);

    // Keyboard shortcut for sidebar toggle (Ctrl/Cmd + B)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "b") {
                event.preventDefault();
                setDesktopSidebarCollapsed((prev) => !prev);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleSignOut = async () => {
        const result = await Swal.fire({
            title: "Konfirmasi Keluar",
            text: "Apakah Anda yakin ingin keluar dari akun?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya, Keluar",
            cancelButtonText: "Batal",
            reverseButtons: true
        });

        if (result.isConfirmed) {
            Swal.fire({
                title: "Sedang keluar...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                await signOut({
                    callbackUrl: "/login",
                    redirect: true
                });
            } catch (error) {
                Swal.fire({
                    title: "Error",
                    text: "Terjadi kesalahan saat keluar. Silakan coba lagi.",
                    icon: "error",
                    confirmButtonText: "OK"
                });
            }
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!session?.user) {
        router.push("/login");
        return null;
    }

    const userRole = session.user.role;
    const isAdmin = userRole === "ADMIN";
    const isSuperAdmin = userRole === "SUPERADMIN";

    if (!isAdmin && !isSuperAdmin) {
        router.push("/dashboard");
        return null;
    }

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Fixed Position */}
            <div
                className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out lg:static lg:transform-none ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } ${
                    desktopSidebarCollapsed ? "lg:w-20" : "lg:w-72"
                } w-72 lg:translate-x-0`}
            >
                {/* Sidebar Content */}
                <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl flex flex-col relative overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-20 translate-x-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl translate-y-16 -translate-x-16"></div>
                    <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-2xl"></div>

                    {/* Header */}
                    <div
                        className={`flex items-center px-6 py-5 relative z-10 ${
                            desktopSidebarCollapsed
                                ? "lg:justify-center lg:px-3"
                                : "justify-between"
                        }`}
                    >
                        {/* Logo for collapsed sidebar */}
                        <div
                            className={`transition-all duration-300 ${
                                desktopSidebarCollapsed
                                    ? "lg:block"
                                    : "lg:hidden"
                            } hidden`}
                        >
                            <button
                                onClick={() =>
                                    setDesktopSidebarCollapsed(false)
                                }
                                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                                title="Expand Sidebar"
                            >
                                <Image
                                    src="/images/logos/logo_surabaya.png"
                                    alt="Logo Surabaya"
                                    width={28}
                                    height={28}
                                    className="object-contain"
                                />
                            </button>
                        </div>

                        {/* Title and Logo for expanded sidebar */}
                        <div
                            className={`flex items-center space-x-3 transition-all duration-300 ${
                                desktopSidebarCollapsed ? "lg:hidden" : ""
                            }`}
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Image
                                    src="/images/logos/logo_surabaya.png"
                                    alt="Logo Surabaya"
                                    width={24}
                                    height={24}
                                    className="object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">
                                    {isSuperAdmin
                                        ? "Super Admin"
                                        : "Admin Panel"}
                                </h1>
                                <p className="text-xs text-slate-300">
                                    Linktree Management
                                </p>
                            </div>
                        </div>

                        {/* Desktop toggle button - only show when expanded */}
                        <button
                            onClick={() =>
                                setDesktopSidebarCollapsed(
                                    !desktopSidebarCollapsed
                                )
                            }
                            className={`hidden lg:flex items-center justify-center w-8 h-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 ${
                                desktopSidebarCollapsed ? "lg:hidden" : ""
                            }`}
                            title="Collapse Sidebar (Ctrl/Cmd + B)"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>

                        {/* Mobile close button */}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-slate-400 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all duration-200"
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

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-6 relative z-10">
                        <div className="px-4 space-y-2">
                            {/* Dashboard */}
                            <Link
                                href={isSuperAdmin ? "/superadmin" : "/admin"}
                                className={`flex items-center px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-200 group ${
                                    desktopSidebarCollapsed
                                        ? "lg:justify-center lg:px-3"
                                        : ""
                                }`}
                                title={
                                    desktopSidebarCollapsed ? "Dashboard" : ""
                                }
                            >
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0"
                                        />
                                    </svg>
                                </div>
                                <span
                                    className={`ml-3 font-medium transition-all duration-300 ${
                                        desktopSidebarCollapsed
                                            ? "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                                            : ""
                                    }`}
                                >
                                    Dashboard
                                </span>
                            </Link>

                            {/* Users */}
                            <Link
                                href={
                                    isSuperAdmin
                                        ? "/superadmin/users"
                                        : "/admin/users"
                                }
                                className={`flex items-center px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-200 group ${
                                    desktopSidebarCollapsed
                                        ? "lg:justify-center lg:px-3"
                                        : ""
                                }`}
                                title={
                                    desktopSidebarCollapsed
                                        ? "Kelola Users"
                                        : ""
                                }
                            >
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                                        />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                                    </svg>
                                </div>
                                <span
                                    className={`ml-3 font-medium transition-all duration-300 ${
                                        desktopSidebarCollapsed
                                            ? "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                                            : ""
                                    }`}
                                >
                                    Kelola Users
                                </span>
                            </Link>

                            {/* Categories */}
                            <Link
                                href={
                                    isSuperAdmin
                                        ? "/superadmin/categories"
                                        : "/admin/categories"
                                }
                                className={`flex items-center px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-200 group ${
                                    desktopSidebarCollapsed
                                        ? "lg:justify-center lg:px-3"
                                        : ""
                                }`}
                                title={
                                    desktopSidebarCollapsed
                                        ? "Kelola Kategori"
                                        : ""
                                }
                            >
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                        />
                                    </svg>
                                </div>
                                <span
                                    className={`ml-3 font-medium transition-all duration-300 ${
                                        desktopSidebarCollapsed
                                            ? "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                                            : ""
                                    }`}
                                >
                                    Kelola Kategori
                                </span>
                            </Link>
                        </div>
                    </nav>

                    {/* User Info */}
                    <div className="p-4 relative z-10">
                        <div
                            className={`flex items-center ${
                                desktopSidebarCollapsed
                                    ? "lg:justify-center"
                                    : "justify-between"
                            }`}
                        >
                            <div
                                className={`min-w-0 flex-1 transition-all duration-300 ${
                                    desktopSidebarCollapsed
                                        ? "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                                        : ""
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                                        {session.user.name
                                            ?.charAt(0)
                                            .toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white truncate">
                                            {session.user.name}
                                        </p>
                                        <p className="text-xs text-slate-300 truncate">
                                            {session.user.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                            isSuperAdmin
                                                ? "bg-purple-500/20 text-purple-200 border border-purple-400/30"
                                                : "bg-blue-500/20 text-blue-200 border border-blue-400/30"
                                        }`}
                                    >
                                        {isSuperAdmin ? "Super Admin" : "Admin"}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Logout button - hidden when collapsed */}
                            <button
                                onClick={handleSignOut}
                                className={`text-slate-400 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-200 flex-shrink-0 ${
                                    desktopSidebarCollapsed ? "lg:hidden ml-3" : "ml-3"
                                }`}
                                title="Keluar"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header - Fixed */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-2 transition-all duration-200"
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
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>

                        {/* Mobile title */}
                        <h1 className="lg:hidden text-xl font-bold text-gray-900">
                            {isSuperAdmin ? "Super Admin" : "Admin Panel"}
                        </h1>

                        {/* Desktop header content */}
                        <div className="hidden lg:flex items-center justify-end flex-1 space-x-4">
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {session.user.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {session.user.email}
                                    </p>
                                </div>
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                                    {session.user.name?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        </div>

                        {/* Mobile spacer */}
                        <div className="lg:hidden w-10"></div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
