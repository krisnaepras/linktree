import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        console.log("Test API - Session:", session?.user);

        return NextResponse.json({
            message: "Test API working",
            user: session?.user,
            hasRole: session?.user?.role,
            isAdmin: session?.user?.role === "ADMIN",
            isSuperAdmin: session?.user?.role === "SUPERADMIN",
            canAccess:
                session?.user?.role &&
                ["ADMIN", "SUPERADMIN"].includes(session.user.role)
        });
    } catch (error) {
        console.error("Test API Error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error },
            { status: 500 }
        );
    }
}
