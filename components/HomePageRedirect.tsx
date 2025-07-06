"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePageRedirect() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        // Only redirect if session is loaded and user is authenticated
        if (status === "loading") return;

        if (session?.user?.role) {
            const role = session.user.role;
            let redirectPath = "/dashboard";

            // Determine redirect path based on role
            if (role === "SUPERADMIN") {
                redirectPath = "/superadmin";
            } else if (role === "ADMIN") {
                redirectPath = "/admin";
            } else {
                redirectPath = "/dashboard";
            }

            // Redirect to appropriate dashboard
            router.push(redirectPath);
        }
    }, [session, status, router]);

    return null;
}
