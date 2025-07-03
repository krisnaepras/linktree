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

        const { searchParams } = new URL(request.url);
        const slug = searchParams.get("slug");

        if (!slug) {
            return NextResponse.json(
                { error: "Slug parameter is required" },
                { status: 400 }
            );
        }

        // Verify the linktree belongs to the user
        const linktree = await prisma.linktree.findFirst({
            where: {
                slug,
                userId: session.user.id
            },
            include: {
                detailLinktrees: {
                    where: {
                        isVisible: true
                    },
                    include: {
                        category: true,
                        clicks: true
                    }
                },
                views: true
            }
        });

        if (!linktree) {
            return NextResponse.json(
                { error: "Linktree tidak ditemukan" },
                { status: 404 }
            );
        }

        // Calculate real statistics from database
        const totalViews = linktree.views.length;
        const totalClicks = linktree.detailLinktrees.reduce(
            (sum, link) => sum + link.clicks.length,
            0
        );

        // Today's views
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayViews = linktree.views.filter(
            (view) => view.createdAt >= today
        ).length;

        // This week's views
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyViews = linktree.views.filter(
            (view) => view.createdAt >= weekAgo
        ).length;

        // Top links by clicks
        const topLinks = linktree.detailLinktrees
            .map((link) => ({
                title: link.title,
                clicks: link.clicks.length,
                url: link.url
            }))
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, 5);

        const stats = {
            profileViews: totalViews,
            totalClicks: totalClicks,
            todayViews: todayViews,
            weeklyViews: weeklyViews,
            topLinks: topLinks
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
