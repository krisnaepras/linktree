import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const { linkId, userAgent, referrer } = await request.json();

        if (!linkId) {
            return NextResponse.json(
                { error: "Link ID is required" },
                { status: 400 }
            );
        }

        // Find the detail linktree
        const detailLinktree = await prisma.detailLinktree.findFirst({
            where: {
                id: linkId,
                isVisible: true
            },
            include: {
                linktree: true
            }
        });

        if (!detailLinktree || !detailLinktree.linktree.isActive) {
            return NextResponse.json(
                { error: "Link not found or not active" },
                { status: 404 }
            );
        }

        // Get IP address
        const forwarded = request.headers.get("x-forwarded-for");
        const ip = forwarded
            ? forwarded.split(",")[0]
            : request.headers.get("x-real-ip") || "unknown";

        // Record the click
        await prisma.linkClick.create({
            data: {
                detailLinktreeId: linkId,
                ipAddress: ip,
                userAgent:
                    userAgent || request.headers.get("user-agent") || "unknown",
                referrer: referrer || request.headers.get("referer") || null
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error recording click:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
