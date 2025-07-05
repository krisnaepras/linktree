import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
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

        const data = await request.formData();
        const file: File | null = data.get("file") as unknown as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp"
        ];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                {
                    error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
                },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 5MB." },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const timestamp = Date.now();
        const fileExt = file.name.split(".").pop();
        const fileName = `${timestamp}-${Math.random()
            .toString(36)
            .substring(2)}.${fileExt}`;

        // Save to public/uploads/articles directory
        const uploadsDir = path.join(
            process.cwd(),
            "public",
            "uploads",
            "articles"
        );
        const filePath = path.join(uploadsDir, fileName);

        try {
            await writeFile(filePath, buffer);
        } catch (error) {
            console.error("Error saving file:", error);
            return NextResponse.json(
                { error: "Failed to save file" },
                { status: 500 }
            );
        }

        // Return the URL path
        const fileUrl = `/uploads/articles/${fileName}`;

        return NextResponse.json({
            url: fileUrl,
            fileName: fileName,
            fileSize: file.size,
            fileType: file.type
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
