"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthRedirectProps {
    excludePaths?: string[];
}

export default function AuthRedirect({ excludePaths = [] }: AuthRedirectProps) {
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

            // Check if current path should be excluded from redirect
            const currentPath = window.location.pathname;
            const shouldExclude = excludePaths.some((path) =>
                currentPath.startsWith(path)
            );

            // Don't redirect if we're already on the target path or an excluded path
            if (
                !shouldExclude &&
                currentPath !== redirectPath &&
                !currentPath.startsWith(redirectPath)
            ) {
                router.push(redirectPath);
            }
        }
    }, [session, status, router, excludePaths]);

    return null;
}
