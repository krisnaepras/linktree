import { withAuth } from "next-auth/middleware";

export default withAuth(
    function middleware(req) {
        const { token } = req.nextauth;
        const { pathname } = req.nextUrl;

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
                // For dashboard routes, allow all authenticated users
                // The middleware function will handle role-based redirects
                if (req.nextUrl.pathname.startsWith("/dashboard")) {
                    return !!token;
                }

                // Protect admin routes
                if (req.nextUrl.pathname.startsWith("/admin")) {
                    return (
                        !!token && ["ADMIN", "SUPERADMIN"].includes(token.role)
                    );
                }

                // Protect superadmin routes
                if (req.nextUrl.pathname.startsWith("/superadmin")) {
                    return !!token && token.role === "SUPERADMIN";
                }

                return true;
            }
        }
    }
);

export const config = {
    matcher: [
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
