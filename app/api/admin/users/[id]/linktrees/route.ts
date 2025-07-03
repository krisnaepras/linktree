import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if user is admin or superadmin
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (
            !currentUser ||
            (currentUser.role !== "ADMIN" && currentUser.role !== "SUPERADMIN")
        ) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const linktrees = await prisma.linktree.findMany({
            where: { userId: params.id },
            include: {
                _count: {
                    select: {
                        detailLinktrees: true
                    }
                },
                detailLinktrees: {
                    include: {
                        category: {
                            select: {
                                name: true,
                                icon: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json(linktrees);
    } catch (error) {
        console.error("Get user linktrees error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
