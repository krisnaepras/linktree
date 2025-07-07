import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadLinktreePhoto } from "@/lib/upload";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const uploadResult = await uploadLinktreePhoto(
            request,
            session.user.id
        );

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
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
