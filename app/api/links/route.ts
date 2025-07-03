import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { title, url, categoryId, sortOrder, isVisible } = body;

        // Validate required fields
        if (!title || !url || !categoryId) {
            return NextResponse.json(
                { error: "Judul, URL, dan kategori harus diisi" },
                { status: 400 }
            );
        }

        // Check if user has a linktree
        const userLinktree = await prisma.linktree.findFirst({
            where: { userId: session.user.id }
        });

        if (!userLinktree) {
            return NextResponse.json(
                { error: "Anda belum memiliki linktree" },
                { status: 400 }
            );
        }

        // Get the next sort order if not provided
        let finalSortOrder = sortOrder;
        if (!finalSortOrder) {
            const lastLink = await prisma.detailLinktree.findFirst({
                where: { linktreeId: userLinktree.id },
                orderBy: { sortOrder: "desc" }
            });
            finalSortOrder = lastLink ? lastLink.sortOrder + 1 : 1;
        }

        const detailLinktree = await prisma.detailLinktree.create({
            data: {
                title,
                url,
                categoryId,
                sortOrder: finalSortOrder,
                isVisible: isVisible ?? true,
                linktreeId: userLinktree.id
            },
            include: {
                category: true
            }
        });

        return NextResponse.json(detailLinktree, { status: 201 });
    } catch (error) {
        console.error("Error creating detail linktree:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
