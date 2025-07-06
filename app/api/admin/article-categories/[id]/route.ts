import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const categorySchema = z.object({
    name: z.string().min(1, "Name is required").max(50, "Name too long"),
    description: z.string().optional()
});

// GET /api/admin/article-categories/[id] - Get single article category
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if user is admin or superadmin
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const category = await prisma.articleCategory.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        articles: true
                    }
                }
            }
        });

        if (!category) {
            return NextResponse.json(
                { error: "Category not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error("Get article category error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT /api/admin/article-categories/[id] - Update article category
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if user is admin or superadmin
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const validatedData = categorySchema.parse(body);

        // Check if category exists
        const existingCategory = await prisma.articleCategory.findUnique({
            where: { id }
        });

        if (!existingCategory) {
            return NextResponse.json(
                { error: "Category not found" },
                { status: 404 }
            );
        }

        // Generate new slug if name changed
        let slug = existingCategory.slug;
        if (validatedData.name !== existingCategory.name) {
            const baseSlug = validatedData.name
                .toLowerCase()
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-")
                .trim();

            slug = baseSlug;
            let counter = 1;

            // Ensure unique slug
            while (
                await prisma.articleCategory.findFirst({
                    where: {
                        slug,
                        id: { not: id }
                    }
                })
            ) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }
        }

        const updatedCategory = await prisma.articleCategory.update({
            where: { id },
            data: {
                name: validatedData.name,
                slug,
                description: validatedData.description || null
            }
        });

        return NextResponse.json(updatedCategory);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Update article category error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/article-categories/[id] - Delete article category
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if user is admin or superadmin
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Check if category exists
        const existingCategory = await prisma.articleCategory.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        articles: true
                    }
                }
            }
        });

        if (!existingCategory) {
            return NextResponse.json(
                { error: "Category not found" },
                { status: 404 }
            );
        }

        // Check if category has articles
        if (existingCategory._count.articles > 0) {
            return NextResponse.json(
                { error: "Cannot delete category with articles" },
                { status: 400 }
            );
        }

        await prisma.articleCategory.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Delete article category error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
