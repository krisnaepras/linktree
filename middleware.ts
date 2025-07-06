import { withAuth } from "next-auth/middleware";

export default withAuth(
    function middleware(req) {
        const { token } = req.nextauth;
        const { pathname } = req.nextUrl;

        // Handle root path redirect for authenticated users
        if (pathname === "/" && token?.role) {
            if (token.role === "SUPERADMIN") {
                return Response.redirect(new URL("/superadmin", req.url));
            }
            if (token.role === "ADMIN") {
                return Response.redirect(new URL("/admin", req.url));
            }
            return Response.redirect(new URL("/dashboard", req.url));
        }

        // Handle login page redirect for authenticated users
        if (pathname === "/login" && token?.role) {
            if (token.role === "SUPERADMIN") {
                return Response.redirect(new URL("/superadmin", req.url));
            }
            if (token.role === "ADMIN") {
                return Response.redirect(new URL("/admin", req.url));
            }
            return Response.redirect(new URL("/dashboard", req.url));
        }

        // Handle register page redirect for authenticated users
        if (pathname === "/register" && token?.role) {
            if (token.role === "SUPERADMIN") {
                return Response.redirect(new URL("/superadmin", req.url));
            }
            if (token.role === "ADMIN") {
                return Response.redirect(new URL("/admin", req.url));
            }
            return Response.redirect(new URL("/dashboard", req.url));
        }

        // Redirect ADMIN and SUPERADMIN away from user dashboard
        if (pathname.startsWith("/dashboard")) {
            if (token?.role === "ADMIN") {
                return Response.redirect(new URL("/admin", req.url));
            }
            if (token?.role === "SUPERADMIN") {
                return Response.redirect(new URL("/superadmin", req.url));
            }
        }

        // Protect /admin routes - only ADMIN and SUPERADMIN can access
        if (pathname.startsWith("/admin")) {
            if (!token?.role || !["ADMIN", "SUPERADMIN"].includes(token.role)) {
                return Response.redirect(new URL("/login", req.url));
            }
        }

        // Protect /superadmin routes - only SUPERADMIN can access
        if (pathname.startsWith("/superadmin")) {
            if (!token?.role || token.role !== "SUPERADMIN") {
                return Response.redirect(new URL("/login", req.url));
            }
        }
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;

                // Allow access to root, login, and register pages
                if (
                    pathname === "/" ||
                    pathname === "/login" ||
                    pathname === "/register"
                ) {
                    return true;
                }

                // For dashboard routes, allow all authenticated users
                // The middleware function will handle role-based redirects
                if (pathname.startsWith("/dashboard")) {
                    return !!token;
                }

                // Protect admin routes
                if (pathname.startsWith("/admin")) {
                    return (
                        !!token && ["ADMIN", "SUPERADMIN"].includes(token.role)
                    );
                }

                // Protect superadmin routes
                if (pathname.startsWith("/superadmin")) {
                    return !!token && token.role === "SUPERADMIN";
                }

                return true;
            }
        }
    }
);

export const config = {
    matcher: [
        "/",
        "/login",
        "/register",
        "/dashboard/:path*",
        "/admin/:path*",
        "/superadmin/:path*",
        "/api/linktree/:path*",
        "/api/categories/:path*",
        "/api/links/:path*",
        "/api/profile/:path*",
        "/api/admin/:path*",
        "/api/stats/:path*"
    ]
};
