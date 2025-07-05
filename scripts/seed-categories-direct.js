// Script untuk menambahkan kategori artikel default langsung ke database
// Jalankan dengan: node scripts/seed-categories-direct.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const defaultCategories = [
    {
        name: "Bisnis & UMKM",
        slug: "bisnis-umkm",
        description: "Artikel tentang pengembangan bisnis dan UMKM",
        icon: "💼",
        color: "#3B82F6"
    },
    {
        name: "Teknologi",
        slug: "teknologi",
        description: "Artikel tentang teknologi dan digital",
        icon: "💻",
        color: "#8B5CF6"
    },
    {
        name: "Tips & Tutorial",
        slug: "tips-tutorial",
        description: "Tips praktis dan tutorial",
        icon: "💡",
        color: "#F59E0B"
    },
    {
        name: "Berita & Update",
        slug: "berita-update",
        description: "Berita terbaru dan update platform",
        icon: "📰",
        color: "#10B981"
    },
    {
        name: "Event & Kegiatan",
        slug: "event-kegiatan",
        description: "Informasi event dan kegiatan",
        icon: "🎉",
        color: "#EF4444"
    }
];

async function seedCategories() {
    try {
        console.log("Seeding article categories directly to database...");

        for (const category of defaultCategories) {
            try {
                // Check if category already exists
                const existingCategory = await prisma.articleCategory.findFirst(
                    {
                        where: {
                            OR: [
                                { slug: category.slug },
                                { name: category.name }
                            ]
                        }
                    }
                );

                if (existingCategory) {
                    console.log(`⚠ Category already exists: ${category.name}`);
                    continue;
                }

                // Create new category
                const created = await prisma.articleCategory.create({
                    data: category
                });

                console.log(`✓ Created category: ${created.name}`);
            } catch (error) {
                console.error(
                    `✗ Failed to create category: ${category.name}`,
                    error.message
                );
            }
        }

        console.log("Article categories seeding completed!");
    } catch (error) {
        console.error("Error seeding categories:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedCategories();
