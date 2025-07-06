import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

// Helper function to get all files in directory recursively
async function getAllFiles(
    dirPath: string,
    arrayOfFiles: string[] = []
): Promise<string[]> {
    try {
        const files = await fs.readdir(dirPath);

        for (const file of files) {
            const fullPath = path.join(dirPath, file);
            const stat = await fs.stat(fullPath);

            if (stat.isDirectory()) {
                await getAllFiles(fullPath, arrayOfFiles);
            } else {
                arrayOfFiles.push(fullPath);
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
    }

    return arrayOfFiles;
}

export async function GET() {
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

        const uploadsPath = path.join(process.cwd(), "public", "uploads");
        const categoryIconsPath = path.join(uploadsPath, "category-icons");
        const articlesPath = path.join(uploadsPath, "articles");
        const linktreePhotosPath = path.join(uploadsPath, "linktree-photos");

        // Get all files in uploads directory
        const allFiles = await getAllFiles(uploadsPath);

        // Get used files from database
        const categories = await prisma.category.findMany({
            select: { icon: true }
        });

        const articles = await prisma.article.findMany({
            select: { featuredImage: true }
        });

        const linktrees = await prisma.linktree.findMany({
            select: { photo: true }
        });

        // Extract file paths from database
        const usedFiles = new Set<string>();

        categories.forEach((cat) => {
            if (cat.icon && cat.icon.startsWith("/uploads/")) {
                usedFiles.add(path.join(process.cwd(), "public", cat.icon));
            }
        });

        articles.forEach((article) => {
            if (
                article.featuredImage &&
                article.featuredImage.startsWith("/uploads/")
            ) {
                usedFiles.add(
                    path.join(process.cwd(), "public", article.featuredImage)
                );
            }
        });

        linktrees.forEach((linktree) => {
            if (linktree.photo && linktree.photo.startsWith("/uploads/")) {
                usedFiles.add(
                    path.join(process.cwd(), "public", linktree.photo)
                );
            }
        });

        // Find unused files
        const unusedFiles = [];
        let totalSize = 0;

        for (const filePath of allFiles) {
            try {
                const stat = await fs.stat(filePath);
                totalSize += stat.size;

                if (!usedFiles.has(filePath)) {
                    const relativePath = path.relative(
                        path.join(process.cwd(), "public"),
                        filePath
                    );
                    const fileName = path.basename(filePath);

                    unusedFiles.push({
                        file: fileName,
                        path: filePath,
                        size: formatFileSize(stat.size),
                        lastModified: stat.mtime.toISOString()
                    });
                }
            } catch (error) {
                console.error(
                    `Error getting stats for file ${filePath}:`,
                    error
                );
            }
        }

        // Count files by type
        const categoriesCount = allFiles.filter((f) =>
            f.includes("category-icons")
        ).length;
        const articlesCount = allFiles.filter((f) =>
            f.includes("articles")
        ).length;
        const linktreePhotosCount = allFiles.filter((f) =>
            f.includes("linktree-photos")
        ).length;

        return NextResponse.json({
            totalFiles: allFiles.length,
            totalSize: formatFileSize(totalSize),
            categoriesCount,
            articlesCount,
            linktreePhotosCount,
            unusedFiles: unusedFiles.sort(
                (a, b) =>
                    new Date(b.lastModified).getTime() -
                    new Date(a.lastModified).getTime()
            )
        });
    } catch (error) {
        console.error("Error getting storage stats:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
