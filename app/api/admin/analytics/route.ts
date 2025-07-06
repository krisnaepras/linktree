import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userRole = session.user.role;
        if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get analytics data
        const [
            totalUsers,
            totalLinktrees,
            totalArticles,
            totalViews,
            topLinktrees,
            topArticles
        ] = await Promise.all([
            // Total users
            prisma.user.count(),

            // Total linktrees
            prisma.linktree.count(),

            // Total articles
            prisma.article.count(),

            // Total views (sum of all linktree views)
            prisma.linktreeView.count(),

            // Top 5 linktrees by views
            prisma.linktree.findMany({
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    user: {
                        select: {
                            name: true
                        }
                    },
                    _count: {
                        select: {
                            views: true
                        }
                    }
                },
                orderBy: {
                    views: {
                        _count: "desc"
                    }
                },
                take: 5
            }),

            // Top 5 articles by views
            prisma.article.findMany({
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    viewCount: true,
                    author: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: {
                    viewCount: "desc"
                },
                take: 5
            })
        ]);

        // Get recent activity (last 10 activities)
        const recentLinktrees = await prisma.linktree.findMany({
            select: {
                id: true,
                title: true,
                createdAt: true,
                user: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 5
        });

        const recentArticles = await prisma.article.findMany({
            select: {
                id: true,
                title: true,
                createdAt: true,
                author: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 5
        });

        // Combine and sort recent activity
        const recentActivity = [
            ...recentLinktrees.map((linktree) => ({
                type: "New Linktree",
                description: `${linktree.user.name} created "${linktree.title}"`,
                timestamp: linktree.createdAt.toISOString()
            })),
            ...recentArticles.map((article) => ({
                type: "New Article",
                description: `${article.author.name} published "${article.title}"`,
                timestamp: article.createdAt.toISOString()
            }))
        ]
            .sort(
                (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
            )
            .slice(0, 10);

        // Transform top linktrees data
        const transformedTopLinktrees = topLinktrees.map((linktree) => ({
            id: linktree.id,
            title: linktree.title,
            slug: linktree.slug,
            views: linktree._count.views,
            user: linktree.user
        }));

        const analyticsData = {
            totalUsers,
            totalLinktrees,
            totalViews,
            totalArticles,
            topLinktrees: transformedTopLinktrees,
            topArticles,
            recentActivity
        };

        return NextResponse.json(analyticsData);
    } catch (error) {
        console.error("Error fetching analytics data:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
