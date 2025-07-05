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

        // Get article statistics
        const [
            totalArticles,
            publishedArticles,
            draftArticles,
            archivedArticles,
            totalViews
        ] = await Promise.all([
            prisma.article.count(),
            prisma.article.count({ where: { status: "PUBLISHED" } }),
            prisma.article.count({ where: { status: "DRAFT" } }),
            prisma.article.count({ where: { status: "ARCHIVED" } }),
            prisma.articleView.count()
        ]);

        const stats = {
            total: totalArticles,
            published: publishedArticles,
            draft: draftArticles,
            archived: archivedArticles,
            totalViews: totalViews
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error fetching article stats:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
