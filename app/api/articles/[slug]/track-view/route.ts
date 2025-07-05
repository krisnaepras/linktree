import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const { articleId } = await request.json();

        if (!articleId) {
            return NextResponse.json(
                { error: "Article ID is required" },
                { status: 400 }
            );
        }

        // Get IP address
        const forwarded = request.headers.get("x-forwarded-for");
        const ip = forwarded
            ? forwarded.split(/, /)[0]
            : request.headers.get("x-real-ip") || "unknown";
        const userAgent = request.headers.get("user-agent") || "unknown";

        // Check if this IP has already viewed this article today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existingView = await prisma.articleView.findFirst({
            where: {
                articleId,
                ipAddress: ip,
                createdAt: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });

        // Only track if no view from this IP today
        if (!existingView) {
            // Create view record
            await prisma.articleView.create({
                data: {
                    articleId,
                    ipAddress: ip,
                    userAgent
                }
            });

            // Update view count on article
            await prisma.article.update({
                where: { id: articleId },
                data: {
                    viewCount: {
                        increment: 1
                    }
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("View tracking error:", error);
        return NextResponse.json(
            { error: "Failed to track view" },
            { status: 500 }
        );
    }
}
