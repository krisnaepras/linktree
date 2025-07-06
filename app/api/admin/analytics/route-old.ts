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
        const promises = [
            // Base analytics data
            prisma.user.count(),
            prisma.linktree.count(),
            prisma.article.count(),
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
        ];

        // Add SuperAdmin specific queries
        if (userRole === "SUPERADMIN") {
            promises.push(
                // User role distribution
                prisma.user.groupBy({
                    by: ['role'],
                    _count: {
                        id: true
                    }
                }),
                // Categories count
                prisma.category.count(),
                // Links count
                prisma.link.count(),
                // Top categories
                prisma.category.findMany({
                    select: {
                        name: true,
                        _count: {
                            select: {
                                detailLinktrees: true
                            }
                        }
                    },
                    orderBy: {
                        detailLinktrees: {
                            _count: "desc"
                        }
                    },
                    take: 6
                })
            );
        }

        const results = await Promise.all(promises);
        
        const [
            totalUsers,
            totalLinktrees,
            totalArticles,
            totalViews,
            topLinktrees,
            topArticles,
            ...superAdminData
        ] = results;
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

        // Base analytics data
        const baseAnalyticsData = {
            totalUsers,
            totalLinktrees,
            totalViews,
            totalArticles,
            topLinktrees: transformedTopLinktrees,
            topArticles,
            recentActivity
        };

        // Add SuperAdmin specific data
        if (userRole === "SUPERADMIN") {
            const [userRoleDistribution, categoriesCount, linksCount, topCategoriesData] = [
                totalUsers, totalLinktrees, totalArticles, totalViews, topLinktrees, topArticles
            ].slice(6) as any[];

            // Process user role distribution
            const userRoles = userRoleDistribution.reduce((acc: any, role: any) => {
                acc[role.role] = role._count.id;
                return acc;
            }, {});

            // Calculate averages
            const averageLinksPerLinktree = totalLinktrees > 0 ? linksCount / totalLinktrees : 0;
            const averageViewsPerLinktree = totalLinktrees > 0 ? totalViews / totalLinktrees : 0;

            // Process top categories
            const topCategories = topCategoriesData.map((category: any) => ({
                name: category.name,
                count: category._count.detailLinktrees
            }));

            // Calculate user growth rate (simplified - you might want to make this more sophisticated)
            const totalRegularUsers = userRoles.USER || 0;
            const totalAdmins = userRoles.ADMIN || 0;
            const totalSuperAdmins = userRoles.SUPERADMIN || 0;
            const userGrowthRate = totalUsers > 0 ? Math.round((totalRegularUsers / totalUsers) * 100) : 0;

            const analyticsData = {
                ...baseAnalyticsData,
                userGrowth: {
                    totalRegularUsers,
                    totalAdmins,
                    totalSuperAdmins,
                    userGrowthRate,
                    monthlyGrowth: [] // Could be enhanced with actual monthly data
                },
                systemStats: {
                    totalCategories: categoriesCount,
                    totalLinks: linksCount,
                    averageLinksPerLinktree,
                    averageViewsPerLinktree,
                    topCategories
                }
            };

            return NextResponse.json(analyticsData);
        }

        return NextResponse.json(baseAnalyticsData);
    } catch (error) {
        console.error("Error fetching analytics data:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
