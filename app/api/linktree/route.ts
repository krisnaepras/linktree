import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const linktree = await prisma.linktree.findFirst({
            where: {
                userId: session.user.id
            },
            include: {
                detailLinktrees: {
                    include: {
                        category: true
                    },
                    orderBy: {
                        sortOrder: "asc"
                    }
                }
            }
        });

        if (!linktree) {
            return NextResponse.json(null);
        }

        return NextResponse.json(linktree);
    } catch (error) {
        console.error("Error fetching linktree:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

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
        const { title, slug, photo, isActive } = body;

        // Check if slug already exists
        const existingLinktree = await prisma.linktree.findUnique({
            where: { slug }
        });

        if (existingLinktree) {
            return NextResponse.json(
                { error: "Slug sudah digunakan" },
                { status: 400 }
            );
        }

        // Check if user already has a linktree
        const userLinktree = await prisma.linktree.findFirst({
            where: { userId: session.user.id }
        });

        if (userLinktree) {
            return NextResponse.json(
                { error: "Anda sudah memiliki linktree" },
                { status: 400 }
            );
        }

        const linktree = await prisma.linktree.create({
            data: {
                title,
                slug,
                photo,
                isActive: isActive ?? true,
                userId: session.user.id
            }
        });

        return NextResponse.json(linktree, { status: 201 });
    } catch (error) {
        console.error("Error creating linktree:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

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
        const { title, slug, photo, isActive } = body;

        // Find user's linktree
        const existingLinktree = await prisma.linktree.findFirst({
            where: { userId: session.user.id }
        });

        if (!existingLinktree) {
            return NextResponse.json(
                { error: "Linktree tidak ditemukan" },
                { status: 404 }
            );
        }

        // Check if slug is being changed and already exists
        if (slug !== existingLinktree.slug) {
            const slugExists = await prisma.linktree.findUnique({
                where: { slug }
            });

            if (slugExists) {
                return NextResponse.json(
                    { error: "Slug sudah digunakan" },
                    { status: 400 }
                );
            }
        }

        const updatedLinktree = await prisma.linktree.update({
            where: { id: existingLinktree.id },
            data: {
                title,
                slug,
                photo,
                isActive
            }
        });

        return NextResponse.json(updatedLinktree);
    } catch (error) {
        console.error("Error updating linktree:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
