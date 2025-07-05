// Script untuk menambahkan kategori artikel default
// Jalankan dengan: node scripts/seed-article-categories.js

const defaultCategories = [
    {
        name: "Bisnis & UMKM",
        description: "Artikel tentang pengembangan bisnis dan UMKM",
        icon: "💼",
        color: "#3B82F6"
    },
    {
        name: "Teknologi",
        description: "Artikel tentang teknologi dan digital",
        icon: "💻",
        color: "#8B5CF6"
    },
    {
        name: "Tips & Tutorial",
        description: "Tips praktis dan tutorial",
        icon: "💡",
        color: "#F59E0B"
    },
    {
        name: "Berita & Update",
        description: "Berita terbaru dan update platform",
        icon: "📰",
        color: "#10B981"
    },
    {
        name: "Event & Kegiatan",
        description: "Informasi event dan kegiatan",
        icon: "🎉",
        color: "#EF4444"
    }
];

async function seedCategories() {
    try {
        console.log("Seeding article categories...");

        for (const category of defaultCategories) {
            const response = await fetch(
                "http://localhost:3001/api/admin/article-categories",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(category)
                }
            );

            if (response.ok) {
                const created = await response.json();
                console.log(`✓ Created category: ${created.name}`);
            } else {
                console.error(`✗ Failed to create category: ${category.name}`);
                console.error(await response.text());
            }
        }

        console.log("Article categories seeding completed!");
    } catch (error) {
        console.error("Error seeding categories:", error);
    }
}

// Uncomment the line below to run when this file is executed
seedCategories();

module.exports = { defaultCategories, seedCategories };
