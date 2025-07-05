const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("Starting to seed article categories...");

    const categories = [
        {
            name: "Bisnis",
            slug: "bisnis",
            description: "Tips dan panduan bisnis untuk UMKM",
            color: "#3B82F6",
            icon: "💼"
        },
        {
            name: "Marketing",
            slug: "marketing",
            description: "Strategi marketing dan promosi",
            color: "#EF4444",
            icon: "📈"
        },
        {
            name: "Keuangan",
            slug: "keuangan",
            description: "Pengelolaan keuangan dan akuntansi",
            color: "#10B981",
            icon: "💰"
        },
        {
            name: "Teknologi",
            slug: "teknologi",
            description: "Teknologi dan digitalisasi UMKM",
            color: "#8B5CF6",
            icon: "💻"
        },
        {
            name: "Motivasi",
            slug: "motivasi",
            description: "Motivasi dan inspirasi untuk pengusaha",
            color: "#F59E0B",
            icon: "🚀"
        },
        {
            name: "Tutorial",
            slug: "tutorial",
            description: "Panduan langkah demi langkah",
            color: "#06B6D4",
            icon: "📚"
        }
    ];

    for (const category of categories) {
        const existingCategory = await prisma.articleCategory.findUnique({
            where: { slug: category.slug }
        });

        if (!existingCategory) {
            await prisma.articleCategory.create({
                data: category
            });
            console.log(`Created category: ${category.name}`);
        } else {
            console.log(`Category already exists: ${category.name}`);
        }
    }

    console.log("Categories seeding completed!");
}

main()
    .catch((e) => {
        console.error("Error seeding categories:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
