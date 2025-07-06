import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if user has admin privileges
        if (
            session.user.role !== "ADMIN" &&
            session.user.role !== "SUPERADMIN"
        ) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const categoryId = params.id;

        // Fetch articles in this category
        const articles = await prisma.article.findMany({
            where: {
                categoryId: categoryId
            },
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                status: true,
                viewCount: true,
                publishedAt: true,
                createdAt: true,
                updatedAt: true,
                category: {
                    select: {
                        name: true,
                        slug: true
                    }
                },
                author: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: [
                { status: "asc" }, // Published first
                { createdAt: "desc" } // Then by newest
            ]
        });

        return NextResponse.json(articles);
    } catch (error) {
        console.error("Error fetching articles by category:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
