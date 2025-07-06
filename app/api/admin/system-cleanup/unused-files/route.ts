import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

// Helper function to format file size
function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if user is superadmin
        if (session.user.role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { files } = body;

        let filesToDelete: string[] = [];

        if (files && Array.isArray(files)) {
            // Delete specific files
            filesToDelete = files;
        } else {
            // If no specific files provided, we should get the list from stats endpoint
            // For now, return error to be safe
            return NextResponse.json(
                { error: "No files specified for deletion" },
                { status: 400 }
            );
        }

        let deletedCount = 0;
        let totalFreedBytes = 0;
        const errors: string[] = [];

        for (const filePath of filesToDelete) {
            try {
                // Security check: ensure file is in uploads directory
                const uploadsPath = path.join(
                    process.cwd(),
                    "public",
                    "uploads"
                );
                const normalizedPath = path.normalize(filePath);

                if (!normalizedPath.startsWith(uploadsPath)) {
                    errors.push(`Invalid file path: ${filePath}`);
                    continue;
                }

                // Check if file exists and get size before deletion
                try {
                    const stat = await fs.stat(filePath);
                    totalFreedBytes += stat.size;
                } catch (statError) {
                    errors.push(`File not found: ${filePath}`);
                    continue;
                }

                // Delete the file
                await fs.unlink(filePath);
                deletedCount++;

                console.log(`Deleted unused file: ${filePath}`);
            } catch (error) {
                console.error(`Error deleting file ${filePath}:`, error);
                errors.push(`Failed to delete: ${filePath}`);
            }
        }

        return NextResponse.json({
            success: true,
            deletedCount,
            freedSpace: formatFileSize(totalFreedBytes),
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error("Error during cleanup:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
