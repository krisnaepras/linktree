const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedSettings() {
    console.log("Seeding default settings...");

    const defaultSettings = [
        {
            key: "siteName",
            value: "Linkku",
            type: "string"
        },
        {
            key: "siteDescription",
            value: "Platform untuk membangun link dalam bio yang menarik",
            type: "string"
        },
        {
            key: "allowRegistration",
            value: "true",
            type: "boolean"
        },
        {
            key: "requireEmailVerification",
            value: "false",
            type: "boolean"
        },
        {
            key: "maxLinksPerUser",
            value: "10",
            type: "number"
        },
        {
            key: "maintenanceMode",
            value: "false",
            type: "boolean"
        },
        {
            key: "theme",
            value: "light",
            type: "string"
        },
        {
            key: "primaryColor",
            value: "#3B82F6",
            type: "string"
        }
    ];

    for (const setting of defaultSettings) {
        try {
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
            console.log(`✓ Setting "${setting.key}" created/updated`);
        } catch (error) {
            console.error(`✗ Error seeding setting "${setting.key}":`, error);
        }
    }

    console.log("Settings seeding completed!");
}

seedSettings()
    .catch((error) => {
        console.error("Error seeding settings:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
