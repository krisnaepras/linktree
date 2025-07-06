"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminIndex() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the new admin dashboard
        router.replace("/admin/dashboard");
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-teal-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">A</span>
                </div>
                <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-slate-600 font-medium">
                    Mengarahkan ke dashboard admin...
                </p>
            </div>
        </div>
    );
}
