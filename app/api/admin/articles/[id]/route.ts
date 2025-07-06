import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const articleUpdateSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(200, "Title too long")
        .optional(),
    content: z.string().min(1, "Content is required").optional(),
    excerpt: z.string().optional().nullable(),
    featuredImage: z
        .string()
        .optional()
        .nullable()
        .refine((val) => {
            if (!val || val === "") return true;
            // Allow both full URLs and relative paths
            return /^(https?:\/\/|\/)/i.test(val);
        }, "Invalid image URL"),
    categoryId: z.string().optional().nullable(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    metaTitle: z.string().max(60).optional().nullable(),
    metaDescription: z.string().max(160).optional().nullable(),
    tags: z.array(z.string()).optional(),
    isFeatured: z.boolean().optional()
});

// GET /api/admin/articles/[id] - Get single article
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

        const article = await prisma.article.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        icon: true,
                        color: true
                    }
                },
                _count: {
                    select: {
                        views: true
                    }
                }
            }
        });

        if (!article) {
            return NextResponse.json(
                { error: "Article not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(article);
    } catch (error) {
        console.error("Get article error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PATCH /api/admin/articles/[id] - Update article
export async function PATCH(
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

        // Check if article exists
        const existingArticle = await prisma.article.findUnique({
            where: { id }
        });

        if (!existingArticle) {
            return NextResponse.json(
                { error: "Article not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        console.log("📨 Received data:", body);

        let validatedData;
        try {
            validatedData = articleUpdateSchema.parse(body);
            console.log("✅ Validation passed:", validatedData);
        } catch (validationError) {
            console.error("❌ Validation failed:", validationError);
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details:
                        validationError instanceof z.ZodError
                            ? validationError.errors
                            : validationError
                },
                { status: 400 }
            );
        }
        console.log("✅ Validated data:", validatedData);

        const updateData: any = { ...validatedData };

        // Handle slug generation if title is updated
        if (
            validatedData.title &&
            validatedData.title !== existingArticle.title
        ) {
            const baseSlug = validatedData.title
                .toLowerCase()
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-")
                .trim();

            let slug = baseSlug;
            let counter = 1;

            // Ensure unique slug (excluding current article)
            while (
                await prisma.article.findFirst({
                    where: {
                        slug,
                        id: { not: id }
                    }
                })
            ) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }

            updateData.slug = slug;
        }

        // Calculate reading time if content is updated
        if (validatedData.content) {
            const wordCount = validatedData.content
                .replace(/<[^>]*>/g, "")
                .split(/\s+/).length;
            updateData.readingTime = Math.ceil(wordCount / 200);

            // Generate excerpt if not provided
            if (!validatedData.excerpt) {
                const plainText = validatedData.content.replace(/<[^>]*>/g, "");
                updateData.excerpt =
                    plainText.substring(0, 150) +
                    (plainText.length > 150 ? "..." : "");
            }
        }

        // Set publishedAt if status is changed to PUBLISHED
        if (
            validatedData.status === "PUBLISHED" &&
            existingArticle.status !== "PUBLISHED"
        ) {
            updateData.publishedAt = new Date();
        }

        // Update meta fields if not provided
        if (validatedData.title && !validatedData.metaTitle) {
            updateData.metaTitle = validatedData.title;
        }

        if (updateData.excerpt && !validatedData.metaDescription) {
            updateData.metaDescription = updateData.excerpt;
        }

        const article = await prisma.article.update({
            where: { id },
            data: updateData,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        icon: true,
                        color: true
                    }
                },
                _count: {
                    select: {
                        views: true
                    }
                }
            }
        });

        return NextResponse.json(article);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Update article error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/articles/[id] - Delete article
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

        // Check if article exists
        const existingArticle = await prisma.article.findUnique({
            where: { id }
        });

        if (!existingArticle) {
            return NextResponse.json(
                { error: "Article not found" },
                { status: 404 }
            );
        }

        await prisma.article.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Article deleted successfully" });
    } catch (error) {
        console.error("Delete article error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
