import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const categorySchema = z.object({
    name: z.string().min(1, "Nama kategori harus diisi"),
    icon: z.string().optional()
});

// Update category (Admin only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = params;
        const body = await request.json();
        const { name, icon } = categorySchema.parse(body);

        // Check if category exists
        const existingCategory = await prisma.category.findUnique({
            where: { id }
        });

        if (!existingCategory) {
            return NextResponse.json(
                { error: "Kategori tidak ditemukan" },
                { status: 404 }
            );
        }

        // Check if name is being changed and already exists
        if (name !== existingCategory.name) {
            const nameExists = await prisma.category.findUnique({
                where: { name }
            });

            if (nameExists) {
                return NextResponse.json(
                    { error: "Nama kategori sudah digunakan" },
                    { status: 400 }
                );
            }
        }

        const updatedCategory = await prisma.category.update({
            where: { id },
            data: {
                name,
                icon: icon || null
            },
            include: {
                _count: {
                    select: {
                        detailLinktrees: true
                    }
                }
            }
        });

        return NextResponse.json(updatedCategory);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            );
        }

        console.error("Error updating category:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Delete category (Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = params;

        // Check if category exists
        const existingCategory = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        detailLinktrees: true
                    }
                }
            }
        });

        if (!existingCategory) {
            return NextResponse.json(
                { error: "Kategori tidak ditemukan" },
                { status: 404 }
            );
        }

        // Check if category is being used
        if (existingCategory._count.detailLinktrees > 0) {
            return NextResponse.json(
                {
                    error: "Kategori tidak dapat dihapus karena sedang digunakan"
                },
                { status: 400 }
            );
        }

        await prisma.category.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Kategori berhasil dihapus" });
    } catch (error) {
        console.error("Error deleting category:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
