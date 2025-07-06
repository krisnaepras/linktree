import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const { articleId } = await request.json();

        if (!articleId) {
            console.log("Track view failed: Article ID is required");
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

        console.log(`Track view request: Article ${articleId}, IP: ${ip}`);

        // Check if this IP has already viewed this article in the last hour
        // Changed from daily to hourly to prevent immediate double tracking
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const existingView = await prisma.articleView.findFirst({
            where: {
                articleId,
                ipAddress: ip,
                createdAt: {
                    gte: oneHourAgo
                }
            }
        });

        if (existingView) {
            console.log(
                `View already tracked for article ${articleId} from IP ${ip} within the last hour`
            );
            return NextResponse.json({
                success: true,
                message: "View already tracked recently"
            });
        }

        // Use transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // Double-check for existing view within transaction
            const doubleCheckView = await tx.articleView.findFirst({
                where: {
                    articleId,
                    ipAddress: ip,
                    createdAt: {
                        gte: oneHourAgo
                    }
                }
            });

            if (doubleCheckView) {
                console.log(
                    `Double-check: View already tracked for article ${articleId} from IP ${ip}`
                );
                return { success: true, tracked: false };
            }

            // Create view record
            await tx.articleView.create({
                data: {
                    articleId,
                    ipAddress: ip,
                    userAgent
                }
            });

            // Update view count on article
            const updatedArticle = await tx.article.update({
                where: { id: articleId },
                data: {
                    viewCount: {
                        increment: 1
                    }
                },
                select: {
                    viewCount: true
                }
            });

            console.log(
                `View tracked successfully for article ${articleId}. New view count: ${updatedArticle.viewCount}`
            );

            return {
                success: true,
                tracked: true,
                newViewCount: updatedArticle.viewCount
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("View tracking error:", error);
        return NextResponse.json(
            { error: "Failed to track view" },
            { status: 500 }
        );
    }
}
