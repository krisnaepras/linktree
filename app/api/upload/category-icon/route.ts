import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { uploadCategoryIcon } from "@/lib/upload";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const uploadResult = await uploadCategoryIcon(request);

        if (!uploadResult.success) {
            return NextResponse.json(
                { error: uploadResult.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            filePath: uploadResult.filePath,
            fileName: uploadResult.fileName
        });
    } catch (error) {
        console.error("Error uploading category icon:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
