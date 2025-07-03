import { withAuth } from "next-auth/middleware";

export default withAuth(
    function middleware(req) {
        // Middleware logic dapat ditambahkan di sini jika diperlukan
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Protect dashboard routes
                if (req.nextUrl.pathname.startsWith("/dashboard")) {
                    return !!token;
                }
                return true;
            }
        }
    }
);

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/api/linktree/:path*",
        "/api/categories/:path*",
        "/api/links/:path*",
        "/api/profile/:path*",
        "/api/admin/:path*",
        "/api/stats/:path*"
    ]
};
