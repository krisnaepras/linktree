import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const profileSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional()
});

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, email, currentPassword, newPassword } =
            profileSchema.parse(body);

        // Check if email is being changed and already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser && existingUser.id !== session.user.id) {
            return NextResponse.json(
                { error: "Email sudah digunakan oleh pengguna lain" },
                { status: 400 }
            );
        }

        // Prepare update data
        const updateData: any = {
            name,
            email
        };

        // Handle password change if provided
        if (newPassword && currentPassword) {
            // Verify current password
            const user = await prisma.user.findUnique({
                where: { id: session.user.id }
            });

            if (!user) {
                return NextResponse.json(
                    { error: "User tidak ditemukan" },
                    { status: 404 }
                );
            }

            const isCurrentPasswordValid = await bcrypt.compare(
                currentPassword,
                user.password
            );

            if (!isCurrentPasswordValid) {
                return NextResponse.json(
                    { error: "Kata sandi saat ini tidak benar" },
                    { status: 400 }
                );
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            updateData.password = hashedPassword;
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return NextResponse.json({
            message: "Profil berhasil diperbarui",
            user: updatedUser
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            );
        }

        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "User tidak ditemukan" },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
