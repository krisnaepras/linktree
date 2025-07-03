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

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = params;

        const detailLinktree = await prisma.detailLinktree.findFirst({
            where: {
                id,
                linktree: {
                    userId: session.user.id
                }
            },
            include: {
                category: true
            }
        });

        if (!detailLinktree) {
            return NextResponse.json(
                { error: "Link tidak ditemukan" },
                { status: 404 }
            );
        }

        return NextResponse.json(detailLinktree);
    } catch (error) {
        console.error("Error fetching detail linktree:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = params;
        const body = await request.json();
        const { title, url, categoryId, sortOrder, isVisible } = body;

        // Check if the link belongs to the user
        const existingLink = await prisma.detailLinktree.findFirst({
            where: {
                id,
                linktree: {
                    userId: session.user.id
                }
            }
        });

        if (!existingLink) {
            return NextResponse.json(
                { error: "Link tidak ditemukan" },
                { status: 404 }
            );
        }

        const updatedLink = await prisma.detailLinktree.update({
            where: { id },
            data: {
                title,
                url,
                categoryId,
                sortOrder,
                isVisible
            },
            include: {
                category: true
            }
        });

        return NextResponse.json(updatedLink);
    } catch (error) {
        console.error("Error updating detail linktree:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = params;

        // Check if the link belongs to the user
        const existingLink = await prisma.detailLinktree.findFirst({
            where: {
                id,
                linktree: {
                    userId: session.user.id
                }
            }
        });

        if (!existingLink) {
            return NextResponse.json(
                { error: "Link tidak ditemukan" },
                { status: 404 }
            );
        }

        await prisma.detailLinktree.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Link berhasil dihapus" });
    } catch (error) {
        console.error("Error deleting detail linktree:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
