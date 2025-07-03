import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
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

        // Get comprehensive statistics
        const [
            totalUsers,
            totalRegularUsers,
            totalAdmins,
            totalSuperAdmins,
            totalCategories,
            totalLinktrees,
            totalLinks,
            recentUsers,
            recentLinktrees,
            popularCategories,
            monthlyStats,
            dailyStats
        ] = await Promise.all([
            // Total users
            prisma.user.count(),

            // Regular users
            prisma.user.count({
                where: { role: "USER" }
            }),

            // Admin users
            prisma.user.count({
                where: { role: "ADMIN" }
            }),

            // Super admin users
            prisma.user.count({
                where: { role: "SUPERADMIN" }
            }),

            // Total categories
            prisma.category.count(),

            // Total linktrees
            prisma.linktree.count(),

            // Total links
            prisma.detailLinktree.count(),

            // Recent users (last 7 days)
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            }),

            // Recent linktrees (last 7 days)
            prisma.linktree.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            }),

            // Popular categories (by usage)
            prisma.category.findMany({
                select: {
                    id: true,
                    name: true,
                    icon: true,
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
                take: 5
            }),

            // Monthly statistics (last 6 months)
            prisma.user.groupBy({
                by: ["createdAt"],
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
                    }
                },
                _count: {
                    id: true
                }
            }),

            // Daily statistics (last 7 days)
            prisma.user.groupBy({
                by: ["createdAt"],
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                },
                _count: {
                    id: true
                }
            })
        ]);

        // Calculate growth rates
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

        const [lastWeekUsers, previousWeekUsers] = await Promise.all([
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: oneWeekAgo
                    }
                }
            }),
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: twoWeeksAgo,
                        lt: oneWeekAgo
                    }
                }
            })
        ]);

        const userGrowthRate =
            previousWeekUsers > 0
                ? ((lastWeekUsers - previousWeekUsers) / previousWeekUsers) *
                  100
                : 0;

        const stats = {
            overview: {
                totalUsers,
                totalRegularUsers,
                totalAdmins,
                totalSuperAdmins,
                totalCategories,
                totalLinktrees,
                totalLinks,
                recentUsers,
                recentLinktrees,
                userGrowthRate: Math.round(userGrowthRate * 100) / 100
            },
            popularCategories,
            trends: {
                monthly: monthlyStats,
                daily: dailyStats
            },
            ratios: {
                linktreesPerUser:
                    totalUsers > 0
                        ? Math.round((totalLinktrees / totalUsers) * 100) / 100
                        : 0,
                linksPerLinktree:
                    totalLinktrees > 0
                        ? Math.round((totalLinks / totalLinktrees) * 100) / 100
                        : 0,
                activeUsersPercentage:
                    totalUsers > 0
                        ? Math.round((totalLinktrees / totalUsers) * 100)
                        : 0
            }
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
