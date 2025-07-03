import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const categorySchema = z.object({
    name: z.string().min(1, "Nama kategori harus diisi"),
    icon: z.string().optional()
});

// Get all categories with usage count (Admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (
            !session?.user?.id ||
            (session.user.role !== "ADMIN" &&
                session.user.role !== "SUPERADMIN")
        ) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const categories = await prisma.category.findMany({
            orderBy: {
                name: "asc"
            },
            include: {
                _count: {
                    select: {
                        detailLinktrees: true
                    }
                }
            }
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Create new category (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (
            !session?.user?.id ||
            (session.user.role !== "ADMIN" &&
                session.user.role !== "SUPERADMIN")
        ) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, icon } = categorySchema.parse(body);

        // Check if category name already exists
        const existingCategory = await prisma.category.findUnique({
            where: { name }
        });

        if (existingCategory) {
            return NextResponse.json(
                { error: "Nama kategori sudah digunakan" },
                { status: 400 }
            );
        }

        const category = await prisma.category.create({
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

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            );
        }

        console.error("Error creating category:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
