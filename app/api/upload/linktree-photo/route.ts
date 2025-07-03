import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { saveUploadedFile, validateImageFile } from "@/lib/upload";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("photo") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file
        const validation = validateImageFile(file);
        if (!validation.isValid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        // Save file
        const uploadDir = path.join(
            process.cwd(),
            "public",
            "uploads",
            "linktree-photos"
        );
        const fileName = `${session.user.id}-${Date.now()}-${file.name.replace(
            /[^a-zA-Z0-9.-]/g,
            "_"
        )}`;
        const filePath = await saveUploadedFile(file, uploadDir, fileName);

        // Return the public path
        const publicPath = `/uploads/linktree-photos/${fileName}`;

        return NextResponse.json({
            success: true,
            filePath: publicPath
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
