"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AdminLayout from "@/components/AdminLayout";
import { Icon } from "@iconify/react";
import Swal from "sweetalert2";

export default function Settings() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("general");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        siteName: "",
        siteDescription: "",
        allowRegistration: true,
        requireEmailVerification: false,
        maxLinksPerUser: 10,
        maintenanceMode: false,
        theme: "light",
        primaryColor: "#3B82F6",
        serverStatus: "online",
        databaseStatus: "connected",
        version: "1.0.0",
        environment: "development",
        nodeVersion: "v18.17.0"
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch("/api/admin/settings");
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSettingChange = (key: string, value: any) => {
        setSettings((prev) => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch("/api/admin/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                await Swal.fire({
                    title: "Success!",
                    text: "Settings saved successfully",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                throw new Error("Failed to save settings");
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            await Swal.fire({
                title: "Error!",
                text: "Failed to save settings. Please try again.",
                icon: "error",
                confirmButtonText: "OK"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleThemeChange = (theme: string) => {
        handleSettingChange("theme", theme);
    };

    const handleColorChange = (color: string) => {
        handleSettingChange("primaryColor", color);
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    const tabs = [
        {
            id: "general",
            label: "General",
            icon: "material-symbols:settings-outline"
        },
        {
            id: "users",
            label: "Users",
            icon: "material-symbols:people-outline"
        },
        {
            id: "system",
            label: "System",
            icon: "material-symbols:computer-outline"
        },
        {
            id: "appearance",
            label: "Appearance",
            icon: "material-symbols:palette-outline"
        }
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center">
                            <Icon
                                icon="material-symbols:settings-outline"
                                className="w-6 h-6 text-white"
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Settings
                            </h1>
                            <p className="text-gray-600">
                                Kelola pengaturan sistem dan konfigurasi
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    <Icon icon={tab.icon} className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* General Settings */}
                        {activeTab === "general" && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Site Name
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.siteName}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                "siteName",
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Site Description
                                    </label>
                                    <textarea
                                        value={settings.siteDescription}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                "siteDescription",
                                                e.target.value
                                            )
                                        }
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Maintenance Mode
                                        </label>
                                        <p className="text-sm text-gray-500">
                                            Aktifkan mode maintenance untuk
                                            mencegah akses user
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            handleSettingChange(
                                                "maintenanceMode",
                                                !settings.maintenanceMode
                                            )
                                        }
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                            settings.maintenanceMode
                                                ? "bg-blue-600"
                                                : "bg-gray-200"
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                                settings.maintenanceMode
                                                    ? "translate-x-6"
                                                    : "translate-x-1"
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* User Settings */}
                        {activeTab === "users" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Allow Registration
                                        </label>
                                        <p className="text-sm text-gray-500">
                                            Izinkan user baru untuk mendaftar
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            handleSettingChange(
                                                "allowRegistration",
                                                !settings.allowRegistration
                                            )
                                        }
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                            settings.allowRegistration
                                                ? "bg-blue-600"
                                                : "bg-gray-200"
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                                settings.allowRegistration
                                                    ? "translate-x-6"
                                                    : "translate-x-1"
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* <div className="flex items-center justify-between">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Email Verification
                                        </label>
                                        <p className="text-sm text-gray-500">
                                            Wajibkan verifikasi email saat
                                            registrasi
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            handleSettingChange(
                                                "requireEmailVerification",
                                                !settings.requireEmailVerification
                                            )
                                        }
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                            settings.requireEmailVerification
                                                ? "bg-blue-600"
                                                : "bg-gray-200"
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                                settings.requireEmailVerification
                                                    ? "translate-x-6"
                                                    : "translate-x-1"
                                            }`}
                                        />
                                    </button>
                                </div> */}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Links per User
                                    </label>
                                    <input
                                        type="number"
                                        value={settings.maxLinksPerUser}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                "maxLinksPerUser",
                                                parseInt(e.target.value)
                                            )
                                        }
                                        min="1"
                                        max="50"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* System Settings */}
                        {activeTab === "system" && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                                            Server Status
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className={`w-2 h-2 rounded-full ${
                                                    settings.serverStatus ===
                                                    "online"
                                                        ? "bg-green-500"
                                                        : "bg-red-500"
                                                }`}
                                            ></div>
                                            <span className="text-sm text-gray-600 capitalize">
                                                {settings.serverStatus}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                                            Database Status
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className={`w-2 h-2 rounded-full ${
                                                    settings.databaseStatus ===
                                                    "connected"
                                                        ? "bg-green-500"
                                                        : "bg-red-500"
                                                }`}
                                            ></div>
                                            <span className="text-sm text-gray-600 capitalize">
                                                {settings.databaseStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                                        System Information
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Version
                                            </span>
                                            <span className="text-sm font-medium">
                                                {settings.version}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Environment
                                            </span>
                                            <span className="text-sm font-medium capitalize">
                                                {settings.environment}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Node.js
                                            </span>
                                            <span className="text-sm font-medium">
                                                {settings.nodeVersion}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional System Actions */}
                                <div className="border-t pt-6">
                                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                                        System Actions
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() =>
                                                window.location.reload()
                                            }
                                            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Icon
                                                icon="material-symbols:refresh"
                                                className="w-4 h-4 mr-2"
                                            />
                                            Refresh System
                                        </button>
                                        <button
                                            onClick={() => {
                                                Swal.fire({
                                                    title: "Clear Cache",
                                                    text: "This will clear all cached data. Continue?",
                                                    icon: "warning",
                                                    showCancelButton: true,
                                                    confirmButtonText:
                                                        "Yes, Clear Cache",
                                                    cancelButtonText: "Cancel"
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        // Clear cache logic here
                                                        Swal.fire(
                                                            "Cache Cleared!",
                                                            "System cache has been cleared.",
                                                            "success"
                                                        );
                                                    }
                                                });
                                            }}
                                            className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                        >
                                            <Icon
                                                icon="material-symbols:clear-all"
                                                className="w-4 h-4 mr-2"
                                            />
                                            Clear Cache
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Appearance Settings */}
                        {activeTab === "appearance" && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-4">
                                        Theme
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            {
                                                id: "light",
                                                name: "Light",
                                                bg: "bg-white"
                                            },
                                            {
                                                id: "dark",
                                                name: "Dark",
                                                bg: "bg-gray-800"
                                            },
                                            {
                                                id: "gradient",
                                                name: "Gradient",
                                                bg: "bg-gradient-to-r from-blue-500 to-purple-500"
                                            }
                                        ].map((theme) => (
                                            <div
                                                key={theme.id}
                                                onClick={() =>
                                                    handleThemeChange(theme.id)
                                                }
                                                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                                    settings.theme === theme.id
                                                        ? "border-blue-500 ring-2 ring-blue-200"
                                                        : "border-gray-200 hover:border-blue-300"
                                                }`}
                                            >
                                                <div
                                                    className={`w-full h-20 ${theme.bg} border border-gray-200 rounded mb-2`}
                                                ></div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">
                                                        {theme.name}
                                                    </span>
                                                    {settings.theme ===
                                                        theme.id && (
                                                        <Icon
                                                            icon="material-symbols:check-circle"
                                                            className="w-4 h-4 text-blue-500"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-4">
                                        Primary Color
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            { color: "#3B82F6", name: "Blue" },
                                            { color: "#10B981", name: "Green" },
                                            {
                                                color: "#8B5CF6",
                                                name: "Purple"
                                            },
                                            {
                                                color: "#F59E0B",
                                                name: "Orange"
                                            },
                                            { color: "#EF4444", name: "Red" },
                                            { color: "#06B6D4", name: "Cyan" },
                                            { color: "#84CC16", name: "Lime" },
                                            { color: "#F97316", name: "Orange" }
                                        ].map((colorOption) => (
                                            <button
                                                key={colorOption.color}
                                                onClick={() =>
                                                    handleColorChange(
                                                        colorOption.color
                                                    )
                                                }
                                                className={`w-10 h-10 rounded-full border-4 transition-all hover:scale-110 ${
                                                    settings.primaryColor ===
                                                    colorOption.color
                                                        ? "border-gray-800"
                                                        : "border-gray-300 hover:border-gray-400"
                                                }`}
                                                style={{
                                                    backgroundColor:
                                                        colorOption.color
                                                }}
                                                title={colorOption.name}
                                            >
                                                {settings.primaryColor ===
                                                    colorOption.color && (
                                                    <Icon
                                                        icon="material-symbols:check"
                                                        className="w-4 h-4 text-white"
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Theme Preview */}
                                <div className="border-t pt-6">
                                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                                        Preview
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                                                style={{
                                                    backgroundColor:
                                                        settings.primaryColor
                                                }}
                                            >
                                                <Icon
                                                    icon="material-symbols:dashboard"
                                                    className="w-4 h-4"
                                                />
                                            </div>
                                            <div>
                                                <p
                                                    className="text-sm font-medium"
                                                    style={{
                                                        color: settings.primaryColor
                                                    }}
                                                >
                                                    {settings.siteName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {settings.siteDescription}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                className="px-3 py-1 text-xs rounded-md text-white"
                                                style={{
                                                    backgroundColor:
                                                        settings.primaryColor
                                                }}
                                            >
                                                Primary Button
                                            </button>
                                            <button className="px-3 py-1 text-xs rounded-md border border-gray-300 text-gray-700">
                                                Secondary Button
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Save Button */}
                    <div className="border-t border-gray-200 px-6 py-4">
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={saving}
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {saving && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                )}
                                <span>
                                    {saving ? "Saving..." : "Save Settings"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
