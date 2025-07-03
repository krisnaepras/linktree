import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const categoryId = params.id;

        // Get all links that use this category
        const links = await prisma.detailLinktree.findMany({
            where: {
                categoryId: categoryId
            },
            include: {
                linktree: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                        icon: true
                    }
                },
                clicks: {
                    select: {
                        id: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json({
            links,
            total: links.length
        });
    } catch (error) {
        console.error("Error fetching category links:", error);
        return NextResponse.json(
            { error: "Failed to fetch category links" },
            { status: 500 }
        );
    }
}
