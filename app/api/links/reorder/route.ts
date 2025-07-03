import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reorderSchema = z.object({
    links: z.array(
        z.object({
            id: z.string(),
            sortOrder: z.number()
        })
    )
});

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { links } = reorderSchema.parse(body);

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

        // Verify all links belong to the user
        const linkIds = links.map((link) => link.id);
        const existingLinks = await prisma.detailLinktree.findMany({
            where: {
                id: { in: linkIds },
                linktreeId: userLinktree.id
            }
        });

        if (existingLinks.length !== links.length) {
            return NextResponse.json(
                {
                    error: "Beberapa link tidak ditemukan atau tidak dapat diakses"
                },
                { status: 400 }
            );
        }

        // Update sort orders using transaction
        await prisma.$transaction(
            links.map((link) =>
                prisma.detailLinktree.update({
                    where: { id: link.id },
                    data: { sortOrder: link.sortOrder }
                })
            )
        );

        return NextResponse.json({
            message: "Urutan link berhasil diperbarui",
            updatedCount: links.length
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            );
        }

        console.error("Error reordering links:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
