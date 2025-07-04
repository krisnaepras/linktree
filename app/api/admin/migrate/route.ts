import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        // Check for admin access (optional security)
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.MIGRATION_SECRET}`) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Run migrations programmatically
        console.log("Running database migrations...");

        // Note: Prisma migrate deploy should be run externally
        // This endpoint can be used for seeding only

        // Check if database is accessible
        await prisma.$connect();
        console.log("Database connected successfully");

        // Run custom seeding logic here if needed
        const userCount = await prisma.user.count();
        console.log(`Current user count: ${userCount}`);

        await prisma.$disconnect();

        return NextResponse.json({
            success: true,
            message: "Database check completed",
            userCount
        });
    } catch (error) {
        console.error("Database setup error:", error);
        return NextResponse.json(
            {
                error: "Database setup failed",
                details:
                    error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
