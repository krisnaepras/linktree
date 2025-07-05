import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/articles - Get published articles for public
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "6");
        const category = searchParams.get("category");
        const featured = searchParams.get("featured");

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            status: "PUBLISHED"
        };

        if (category) {
            where.category = {
                slug: category
            };
        }

        if (featured === "true") {
            where.isFeatured = true;
        }

        // Get articles with pagination
        const [articles, total] = await Promise.all([
            prisma.article.findMany({
                where,
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            icon: true,
                            color: true
                        }
                    },
                    _count: {
                        select: {
                            views: true
                        }
                    }
                },
                orderBy: [
                    { isFeatured: "desc" },
                    { publishedAt: "desc" },
                    { createdAt: "desc" }
                ],
                skip,
                take: limit
            }),
            prisma.article.count({ where })
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return NextResponse.json({
            articles,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage,
                hasPrevPage
            }
        });
    } catch (error) {
        console.error("Get public articles error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
