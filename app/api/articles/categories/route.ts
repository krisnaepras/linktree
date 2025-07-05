import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/articles/categories - Get all article categories for public
export async function GET() {
    try {
        const categories = await prisma.articleCategory.findMany({
            include: {
                _count: {
                    select: {
                        articles: {
                            where: {
                                status: "PUBLISHED"
                            }
                        }
                    }
                }
            },
            orderBy: { name: "asc" }
        });

        return NextResponse.json({ categories });
    } catch (error) {
        console.error("Get article categories error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
