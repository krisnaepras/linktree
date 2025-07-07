import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { uploadCategoryIcon } from "@/lib/upload";

export async function POST(request: NextRequest) {
    try {
        console.log("Category icon upload request received");

        const session = await getServerSession(authOptions);

        if (
            !session?.user?.id ||
            (session.user.role !== "ADMIN" &&
                session.user.role !== "SUPERADMIN")
        ) {
            console.log("Unauthorized upload attempt:", session?.user?.email);
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        console.log("Upload authorized for user:", session.user.email);

        const uploadResult = await uploadCategoryIcon(request);
        console.log("Upload result:", uploadResult);

        if (!uploadResult.success) {
            console.error("Upload failed:", uploadResult.error);
            return NextResponse.json(
                { error: uploadResult.error },
                { status: 400 }
            );
        }

        console.log("Upload successful:", uploadResult.filePath);
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
