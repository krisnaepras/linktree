import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (
            !session?.user?.role ||
            !["ADMIN", "SUPERADMIN"].includes(session.user.role)
        ) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const categories = await prisma.articleCategory.findMany({
            orderBy: { name: "asc" }
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching article categories:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
