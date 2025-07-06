import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const articleSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    content: z.string().min(1, "Content is required"),
    excerpt: z.string().optional(),
    featuredImage: z
        .string()
        .optional()
        .refine((val) => {
            if (!val || val === "") return true;
            // Allow both full URLs and relative paths
            return /^(https?:\/\/|\/)/i.test(val);
        }, "Invalid image URL"),
    categoryId: z.string().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    tags: z.array(z.string()).default([]),
    isFeatured: z.boolean().default(false)
});

// GET /api/admin/articles - Get all articles
export async function GET(request: Request) {
    try {
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

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const status = searchParams.get("status");
        const category = searchParams.get("category");
        const search = searchParams.get("search");

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        if (status && status !== "ALL") {
            where.status = status;
        }

        if (category) {
            where.categoryId = category;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { content: { contains: search, mode: "insensitive" } }
            ];
        }

        const [articles, total] = await Promise.all([
            prisma.article.findMany({
                where,
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
                },
                orderBy: {
                    createdAt: "desc"
                },
                skip,
                take: limit
            }),
            prisma.article.count({ where })
        ]);

        return NextResponse.json({
            articles,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Get articles error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/admin/articles - Create new article
export async function POST(request: Request) {
    try {
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
        const validatedData = articleSchema.parse(body);

        // Generate slug from title
        const baseSlug = validatedData.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .trim();

        let slug = baseSlug;
        let counter = 1;

        // Ensure unique slug
        while (await prisma.article.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        // Calculate reading time (rough estimate: 200 words per minute)
        const wordCount = validatedData.content
            .replace(/<[^>]*>/g, "")
            .split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200);

        // Generate excerpt if not provided
        let excerpt = validatedData.excerpt;
        if (!excerpt) {
            const plainText = validatedData.content.replace(/<[^>]*>/g, "");
            excerpt =
                plainText.substring(0, 150) +
                (plainText.length > 150 ? "..." : "");
        }

        const article = await prisma.article.create({
            data: {
                title: validatedData.title,
                slug,
                content: validatedData.content,
                excerpt,
                featuredImage: validatedData.featuredImage || null,
                authorId: session.user.id,
                categoryId: validatedData.categoryId || null,
                status: validatedData.status,
                metaTitle: validatedData.metaTitle || validatedData.title,
                metaDescription: validatedData.metaDescription || excerpt,
                tags: validatedData.tags,
                readingTime,
                isFeatured: validatedData.isFeatured,
                publishedAt:
                    validatedData.status === "PUBLISHED" ? new Date() : null
            },
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
                }
            }
        });

        return NextResponse.json(article, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Create article error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
