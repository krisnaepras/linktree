"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-transparent z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-30 bg-white shadow-xl transform transition-all duration-300 ease-in-out lg:relative lg:transform-none lg:flex lg:flex-col ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } ${
                    desktopSidebarCollapsed ? "lg:w-16" : "lg:w-64"
                } w-64 lg:translate-x-0`}
            >
                <div className="flex items-center justify-between px-4 py-4 border-b min-h-[73px]">
                    <h1
                        className={`font-bold text-gray-900 transition-all duration-300 ${
                            desktopSidebarCollapsed ? "lg:hidden" : "text-xl"
                        }`}
                    >
                        {isSuperAdmin ? "Super Admin" : "Admin Panel"}
                    </h1>

                    {/* Desktop toggle button */}
                    <button
                        onClick={() =>
                            setDesktopSidebarCollapsed(!desktopSidebarCollapsed)
                        }
                        className="hidden lg:flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                        title={`${
                            desktopSidebarCollapsed ? "Expand" : "Collapse"
                        } Sidebar (Ctrl/Cmd + B)`}
                    >
                        <svg
                            className={`w-5 h-5 transition-transform duration-200 ${
                                desktopSidebarCollapsed ? "rotate-180" : ""
                            }`}
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
                        className="lg:hidden text-gray-500 hover:text-gray-700"
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

                <nav className="flex-1 mt-6">
                    <div className="px-4 space-y-2">
                        {/* Dashboard Overview */}
                        <Link
                            href={isSuperAdmin ? "/superadmin" : "/admin"}
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors group"
                            title={desktopSidebarCollapsed ? "Dashboard" : ""}
                        >
                            <svg
                                className="w-5 h-5 mr-3 flex-shrink-0"
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
                            <span
                                className={`transition-all duration-300 ${
                                    desktopSidebarCollapsed
                                        ? "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                                        : ""
                                }`}
                            >
                                Dashboard
                            </span>
                        </Link>

                        {/* User Management */}
                        <Link
                            href={
                                isSuperAdmin
                                    ? "/superadmin/users"
                                    : "/admin/users"
                            }
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors group"
                            title={
                                desktopSidebarCollapsed ? "Kelola Users" : ""
                            }
                        >
                            <svg
                                className="w-5 h-5 mr-3 flex-shrink-0"
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
                            <span
                                className={`transition-all duration-300 ${
                                    desktopSidebarCollapsed
                                        ? "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                                        : ""
                                }`}
                            >
                                Kelola Users
                            </span>
                        </Link>

                        {/* Category Management */}
                        <Link
                            href={
                                isSuperAdmin
                                    ? "/superadmin/categories"
                                    : "/admin/categories"
                            }
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors group"
                            title={
                                desktopSidebarCollapsed ? "Kelola Kategori" : ""
                            }
                        >
                            <svg
                                className="w-5 h-5 mr-3 flex-shrink-0"
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
                            <span
                                className={`transition-all duration-300 ${
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

                {/* User info and logout */}
                <div className="p-4 border-t mt-auto">
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
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {session.user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {session.user.email}
                            </p>
                            <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                                    isSuperAdmin
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-blue-100 text-blue-800"
                                }`}
                            >
                                {isSuperAdmin ? "Super Admin" : "Admin"}
                            </span>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className={`text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0 ${
                                desktopSidebarCollapsed ? "" : "ml-3"
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

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Desktop header */}
                <div className="hidden lg:block bg-white border-b px-6 py-4 min-h-[73px]">
                    <div className="flex items-center justify-end space-x-4 h-full">
                        {/* <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {isSuperAdmin
                                    ? "Super Admin Dashboard"
                                    : "Admin Dashboard"}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Kelola pengguna dan konten platform
                            </p>
                        </div> */}
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    {session.user.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {session.user.email}
                                </p>
                            </div>
                            <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    isSuperAdmin
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-blue-100 text-blue-800"
                                }`}
                            >
                                {isSuperAdmin ? "Super Admin" : "Admin"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Mobile header */}
                <div className="lg:hidden bg-white border-b px-4 py-4 min-h-[73px]">
                    <div className="flex items-center justify-between h-full">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-gray-500 hover:text-gray-700"
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
                        <h1 className="text-lg font-semibold text-gray-900">
                            {isSuperAdmin ? "Super Admin" : "Admin Panel"}
                        </h1>
                        <div className="w-6"></div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
