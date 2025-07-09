import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userRole = session.user.role;
        if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get all settings from database
        const settings = await prisma.setting.findMany({
            select: {
                key: true,
                value: true,
                type: true
            }
        });

        // Transform settings to object format
        const settingsObject: any = {};
        settings.forEach((setting) => {
            let value: any = setting.value;

            // Parse based on type
            if (setting.type === "boolean") {
                value = value === "true";
            } else if (setting.type === "number") {
                value = parseInt(value);
            } else if (setting.type === "json") {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    value = setting.value;
                }
            }

            settingsObject[setting.key] = value;
        });

        // Set default values if not found in database
        const defaultSettings = {
            siteName: "Linkku",
            siteDescription:
                "Platform untuk membangun link dalam bio yang menarik",
            allowRegistration: true,
            requireEmailVerification: false,
            maxLinksPerUser: 10,
            maintenanceMode: false,
            theme: "light",
            primaryColor: "#3B82F6",
            serverStatus: "online",
            databaseStatus: "connected",
            version: "1.0.0",
            environment: process.env.NODE_ENV || "development",
            nodeVersion: process.version
        };

        const finalSettings = { ...defaultSettings, ...settingsObject };

        return NextResponse.json(finalSettings);
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userRole = session.user.role;
        if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();

        // Validate required fields
        const allowedKeys = [
            "siteName",
            "siteDescription",
            "allowRegistration",
            "requireEmailVerification",
            "maxLinksPerUser",
            "maintenanceMode",
            "theme",
            "primaryColor"
        ];

        // Update settings in database
        const settingsToUpdate = Object.entries(body)
            .filter(([key]) => allowedKeys.includes(key))
            .map(([key, value]) => {
                let type = "string";
                let stringValue = String(value);

                if (typeof value === "boolean") {
                    type = "boolean";
                    stringValue = value.toString();
                } else if (typeof value === "number") {
                    type = "number";
                    stringValue = value.toString();
                } else if (typeof value === "object") {
                    type = "json";
                    stringValue = JSON.stringify(value);
                }

                return {
                    key,
                    value: stringValue,
                    type
                };
            });

        // Use upsert to create or update settings
        for (const setting of settingsToUpdate) {
            await prisma.setting.upsert({
                where: { key: setting.key },
                update: {
                    value: setting.value,
                    type: setting.type
                },
                create: {
                    key: setting.key,
                    value: setting.value,
                    type: setting.type
                }
            });
        }

        return NextResponse.json({
            message: "Settings saved successfully",
            updated: settingsToUpdate.length
        });
    } catch (error) {
        console.error("Error saving settings:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
