import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const { slug, userAgent, referrer } = await request.json();

        if (!slug) {
            return NextResponse.json(
                { error: "Slug is required" },
                { status: 400 }
            );
        }

        // Find the linktree
        const linktree = await prisma.linktree.findFirst({
            where: {
                slug: slug,
                isActive: true
            }
        });

        if (!linktree) {
            return NextResponse.json(
                { error: "Linktree not found" },
                { status: 404 }
            );
        }

        // Get IP address
        const forwarded = request.headers.get("x-forwarded-for");
        const ip = forwarded
            ? forwarded.split(",")[0]
            : request.headers.get("x-real-ip") || "unknown";

        // Record the view
        await prisma.linktreeView.create({
            data: {
                linktreeId: linktree.id,
                ipAddress: ip,
                userAgent:
                    userAgent || request.headers.get("user-agent") || "unknown"
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error recording view:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
