import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (
            !session?.user?.role ||
            !["ADMIN", "SUPERADMIN"].includes(session.user.role)
        ) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        linktrees: true
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check if ADMIN is trying to access non-USER account
        if (session.user.role === "ADMIN" && user.role !== "USER") {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (
            !session?.user?.role ||
            !["ADMIN", "SUPERADMIN"].includes(session.user.role)
        ) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { name, email, role } = await request.json();

        // Get current user data
        const currentUser = await prisma.user.findUnique({
            where: { id: params.id },
            select: { role: true }
        });

        if (!currentUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check if ADMIN is trying to modify non-USER account
        if (session.user.role === "ADMIN" && currentUser.role !== "USER") {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            );
        }

        // Check if ADMIN is trying to set role other than USER
        if (session.user.role === "ADMIN" && role && role !== "USER") {
            return NextResponse.json(
                { error: "Admin can only set USER role" },
                { status: 403 }
            );
        }

        // Prevent changing own role
        if (params.id === session.user.id) {
            return NextResponse.json(
                { error: "Cannot modify own account" },
                { status: 403 }
            );
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: params.id },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(role && { role })
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (
            !session?.user?.role ||
            !["ADMIN", "SUPERADMIN"].includes(session.user.role)
        ) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get current user data
        const currentUser = await prisma.user.findUnique({
            where: { id: params.id },
            select: { role: true }
        });

        if (!currentUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check if ADMIN is trying to delete non-USER account
        if (session.user.role === "ADMIN" && currentUser.role !== "USER") {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            );
        }

        // Prevent deleting own account
        if (params.id === session.user.id) {
            return NextResponse.json(
                { error: "Cannot delete own account" },
                { status: 403 }
            );
        }

        // Delete user (cascade will handle related records)
        await prisma.user.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
