"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { signOut } from "next-auth/react";
import { Icon } from "@iconify/react";
import { getAppName } from "@/lib/utils";

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
            <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 flex items-center justify-center">
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
        <div className="admin-layout h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 flex overflow-hidden">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Modern & Clean */}
            <div
                className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out lg:static lg:transform-none ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } ${
                    desktopSidebarCollapsed ? "lg:w-20" : "lg:w-72"
                } w-72 lg:translate-x-0`}
            >
                {/* Sidebar Content */}
                <div className="h-full bg-white shadow-xl border-r border-slate-200 flex flex-col relative overflow-hidden">
                    {/* Header */}
                    <div
                        className={`flex items-center px-6 py-6 border-b border-slate-200 bg-gradient-to-r from-sky-500 to-teal-500 ${
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
                                className="w-12 h-12 flex items-center justify-center transition-all duration-200 hover:scale-105 bg-transparent"
                                title="Expand Sidebar"
                            >
                                <Image
                                    src="/images/logos/logo_linkku.png"
                                    alt="Logo Linkku"
                                    width={32}
                                    height={32}
                                    className="object-contain w-8 h-8"
                                />
                            </button>
                        </div>

                        {/* Title and Logo for expanded sidebar */}
                        <div
                            className={`flex items-center space-x-3 transition-all duration-300 ${
                                desktopSidebarCollapsed ? "lg:hidden" : ""
                            }`}
                        >
                            <Image
                                src="/images/logos/logo_linkku.png"
                                alt="Logo Linkku"
                                width={40}
                                height={40}
                                className="object-contain w-8 h-8"
                            />
                            <div>
                                <h1 className="text-lg font-bold text-white">
                                    {getAppName()}
                                </h1>
                            </div>
                        </div>

                        {/* Desktop toggle button */}
                        <button
                            onClick={() =>
                                setDesktopSidebarCollapsed(
                                    !desktopSidebarCollapsed
                                )
                            }
                            className={`hidden lg:flex items-center justify-center w-8 h-8 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200 ${
                                desktopSidebarCollapsed ? "lg:hidden" : ""
                            }`}
                            title="Collapse Sidebar (Ctrl/Cmd + B)"
                        >
                            <Icon
                                icon="material-symbols:chevron-left"
                                className="w-5 h-5"
                            />
                        </button>

                        {/* Mobile close button */}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-white/70 hover:text-white hover:bg-white/20 rounded-lg p-1 transition-all duration-200"
                        >
                            <Icon
                                icon="material-symbols:close"
                                className="w-6 h-6"
                            />
                        </button>
                    </div>

                    {/* Navigation - Clean & Modern */}
                    <nav className="flex-1 overflow-y-auto py-4">
                        <div className="px-4 space-y-2">
                            {/* Dashboard */}
                            <Link
                                href={isSuperAdmin ? "/superadmin" : "/admin"}
                                className={`flex items-center px-4 py-3 text-slate-600 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-all duration-200 group border border-transparent hover:border-sky-200 ${
                                    desktopSidebarCollapsed
                                        ? "lg:justify-center lg:px-3"
                                        : ""
                                }`}
                                title={
                                    desktopSidebarCollapsed ? "Dashboard" : ""
                                }
                            >
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <Icon
                                        icon="material-symbols:dashboard-outline"
                                        className="w-5 h-5 flex-shrink-0"
                                    />
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
                                className={`flex items-center px-4 py-3 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all duration-200 group border border-transparent hover:border-emerald-200 ${
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
                                    <Icon
                                        icon="ph:users"
                                        className="w-5 h-5 flex-shrink-0"
                                    />
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
                                className={`flex items-center px-4 py-3 text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-xl transition-all duration-200 group border border-transparent hover:border-teal-200 ${
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
                                    <Icon
                                        icon="material-symbols:category-outline"
                                        className="w-5 h-5 flex-shrink-0"
                                    />
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

                            {/* Articles */}
                            <Link
                                href="/admin/articles"
                                className={`flex items-center px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all duration-200 group border border-transparent hover:border-blue-200 ${
                                    desktopSidebarCollapsed
                                        ? "lg:justify-center lg:px-3"
                                        : ""
                                }`}
                                title={
                                    desktopSidebarCollapsed
                                        ? "Kelola Artikel"
                                        : ""
                                }
                            >
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <Icon
                                        icon="material-symbols:article-outline"
                                        className="w-5 h-5 flex-shrink-0"
                                    />
                                </div>
                                <span
                                    className={`ml-3 font-medium transition-all duration-300 ${
                                        desktopSidebarCollapsed
                                            ? "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                                            : ""
                                    }`}
                                >
                                    Kelola Artikel
                                </span>
                            </Link>

                            {/* Article Categories */}
                            <Link
                                href="/admin/article-categories"
                                className={`flex items-center px-4 py-3 text-slate-600 hover:bg-gray-50 hover:text-gray-700 rounded-xl transition-all duration-200 group border border-transparent hover:border-gray-200 ${
                                    desktopSidebarCollapsed
                                        ? "lg:justify-center lg:px-3"
                                        : ""
                                }`}
                                title={
                                    desktopSidebarCollapsed
                                        ? "Kategori Artikel"
                                        : ""
                                }
                            >
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <Icon
                                        icon="ph:folder"
                                        className="w-5 h-5 flex-shrink-0"
                                    />
                                </div>
                                <span
                                    className={`ml-3 font-medium transition-all duration-300 ${
                                        desktopSidebarCollapsed
                                            ? "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                                            : ""
                                    }`}
                                >
                                    Kategori Artikel
                                </span>
                            </Link>

                            {/* Divider */}
                            <div className="my-4 border-t border-slate-200"></div>

                            {/* Analytics */}
                            <Link
                                href="/admin/analytics"
                                className={`flex items-center px-4 py-3 text-slate-600 hover:bg-orange-50 hover:text-orange-700 rounded-xl transition-all duration-200 group border border-transparent hover:border-orange-200 ${
                                    desktopSidebarCollapsed
                                        ? "lg:justify-center lg:px-3"
                                        : ""
                                }`}
                                title={
                                    desktopSidebarCollapsed ? "Analytics" : ""
                                }
                            >
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <Icon
                                        icon="material-symbols:analytics-outline"
                                        className="w-5 h-5 flex-shrink-0"
                                    />
                                </div>
                                <span
                                    className={`ml-3 font-medium transition-all duration-300 ${
                                        desktopSidebarCollapsed
                                            ? "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                                            : ""
                                    }`}
                                >
                                    Analytics
                                </span>
                            </Link>

                            {/* System Cleanup - Only for SuperAdmin */}
                            {isSuperAdmin && (
                                <Link
                                    href="/superadmin/system-cleanup"
                                    className={`flex items-center px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200 group border border-transparent hover:border-red-200 ${
                                        desktopSidebarCollapsed
                                            ? "lg:justify-center lg:px-3"
                                            : ""
                                    }`}
                                    title={
                                        desktopSidebarCollapsed
                                            ? "System Cleanup"
                                            : ""
                                    }
                                >
                                    <div className="w-6 h-6 flex items-center justify-center">
                                        <Icon
                                            icon="material-symbols:cleaning-services-outline"
                                            className="w-5 h-5 flex-shrink-0"
                                        />
                                    </div>
                                    <span
                                        className={`ml-3 font-medium transition-all duration-300 ${
                                            desktopSidebarCollapsed
                                                ? "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                                                : ""
                                        }`}
                                    >
                                        System Cleanup
                                    </span>
                                </Link>
                            )}
                        </div>
                    </nav>

                    {/* User Info */}
                    <div className="p-4 relative z-10 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200">
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
                                    <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                                        {session.user.name
                                            ?.charAt(0)
                                            .toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800 truncate">
                                            {session.user.name}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">
                                            {session.user.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                            isSuperAdmin
                                                ? "bg-purple-100 text-purple-700 border border-purple-200"
                                                : "bg-sky-100 text-sky-700 border border-sky-200"
                                        }`}
                                    >
                                        {isSuperAdmin ? "Super Admin" : "Admin"}
                                    </span>
                                </div>
                            </div>

                            {/* Logout button - always visible */}
                            <button
                                onClick={handleSignOut}
                                className={`text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg p-2 transition-all duration-200 flex-shrink-0 ${
                                    desktopSidebarCollapsed
                                        ? "lg:mx-auto"
                                        : "ml-3"
                                }`}
                                title="Keluar"
                            >
                                <Icon
                                    icon="material-symbols:logout"
                                    className="w-5 h-5"
                                />
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
                            <Icon
                                icon="material-symbols:menu"
                                className="w-6 h-6"
                            />
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
                                <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                    {session.user.name?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        </div>

                        {/* Mobile spacer */}
                        <div className="lg:hidden w-10"></div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gradient-to-br from-sky-50 via-white to-teal-50 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
