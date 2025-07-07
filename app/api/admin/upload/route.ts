import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadArticleImage } from "@/lib/upload";

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

        // Convert to NextRequest for compatibility with upload function
        const formData = await request.formData();
        const file = formData.get("file") as File;
        
        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        // Create a new FormData with the correct field name
        const uploadFormData = new FormData();
        uploadFormData.append("image", file);

        // Create a mock request object
        const mockRequest = {
            formData: async () => uploadFormData
        } as any;

        const uploadResult = await uploadArticleImage(mockRequest);

        if (!uploadResult.success) {
            return NextResponse.json(
                { error: uploadResult.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            url: uploadResult.filePath,
            fileName: uploadResult.fileName,
            fileSize: file.size,
            fileType: file.type,
            success: true
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
