const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function getStorageStats() {
    console.log("📊 Storage Usage Statistics\n");

    try {
        // Define upload directories
        const uploadDirs = [
            {
                name: "Articles",
                path: path.join(process.cwd(), "public", "uploads", "articles"),
                icon: "📄"
            },
            {
                name: "Category Icons",
                path: path.join(
                    process.cwd(),
                    "public",
                    "uploads",
                    "category-icons"
                ),
                icon: "🏷️"
            },
            {
                name: "Linktree Photos",
                path: path.join(
                    process.cwd(),
                    "public",
                    "uploads",
                    "linktree-photos"
                ),
                icon: "📸"
            }
        ];

        let totalFiles = 0;
        let totalSize = 0;
        const stats = [];

        for (const dir of uploadDirs) {
            if (!fs.existsSync(dir.path)) {
                stats.push({
                    name: dir.name,
                    icon: dir.icon,
                    files: 0,
                    size: 0,
                    sizeFormatted: "0 Bytes"
                });
                continue;
            }

            const files = fs.readdirSync(dir.path).filter((file) => {
                return file !== ".gitkeep";
            });

            let dirSize = 0;
            for (const file of files) {
                const filePath = path.join(dir.path, file);
                const stat = fs.statSync(filePath);
                dirSize += stat.size;
            }

            stats.push({
                name: dir.name,
                icon: dir.icon,
                files: files.length,
                size: dirSize,
                sizeFormatted: formatBytes(dirSize)
            });

            totalFiles += files.length;
            totalSize += dirSize;
        }

        // Display statistics
        console.log("┌─────────────────────────────────────────────────────┐");
        console.log("│                 STORAGE SUMMARY                     │");
        console.log("└─────────────────────────────────────────────────────┘");

        stats.forEach((stat) => {
            console.log(
                `${stat.icon} ${stat.name.padEnd(20)} ${stat.files
                    .toString()
                    .padStart(3)} files  ${stat.sizeFormatted.padStart(10)}`
            );
        });

        console.log("─".repeat(55));
        console.log(
            `📦 Total Storage Used: ${totalFiles} files, ${formatBytes(
                totalSize
            )}`
        );
        console.log("");

        // Database statistics
        console.log("┌─────────────────────────────────────────────────────┐");
        console.log("│                DATABASE REFERENCES                  │");
        console.log("└─────────────────────────────────────────────────────┘");

        const dbStats = await getDatabaseStats();

        console.log(`📄 Articles with images: ${dbStats.articlesWithImages}`);
        console.log(
            `🏷️  Categories with icons: ${dbStats.categoriesWithIcons}`
        );
        console.log(`📸 Linktrees with photos: ${dbStats.linktreesWithPhotos}`);
        console.log(`🖼️  Images in content: ${dbStats.imagesInContent}`);
        console.log("");

        // Recommendations
        console.log("┌─────────────────────────────────────────────────────┐");
        console.log("│                 RECOMMENDATIONS                     │");
        console.log("└─────────────────────────────────────────────────────┘");

        if (totalSize > 100 * 1024 * 1024) {
            // > 100MB
            console.log("⚠️  High storage usage detected (>100MB)");
            console.log("💡 Consider running cleanup: npm run cleanup:check");
        }

        if (totalFiles > 100) {
            console.log("⚠️  Large number of files detected (>100)");
            console.log("💡 Consider periodic cleanup maintenance");
        }

        if (totalSize < 10 * 1024 * 1024) {
            // < 10MB
            console.log("✅ Storage usage is optimal (<10MB)");
        }

        console.log("💡 Run 'npm run cleanup:check' to identify unused files");
        console.log("");
    } catch (error) {
        console.error("❌ Error getting storage statistics:", error);
    } finally {
        await prisma.$disconnect();
    }
}

async function getDatabaseStats() {
    const [
        articlesWithImages,
        categoriesWithIcons,
        linktreesWithPhotos,
        articlesWithContent
    ] = await Promise.all([
        prisma.article.count({
            where: {
                featuredImage: {
                    not: null
                }
            }
        }),
        prisma.category.count({
            where: {
                icon: {
                    not: null
                }
            }
        }),
        prisma.linktree.count({
            where: {
                photo: {
                    not: null
                }
            }
        }),
        prisma.article.findMany({
            where: {
                content: {
                    contains: "<img"
                }
            },
            select: {
                content: true
            }
        })
    ]);

    // Count images in content
    let imagesInContent = 0;
    articlesWithContent.forEach((article) => {
        if (article.content) {
            const imgMatches = article.content.match(/<img[^>]*>/g);
            if (imgMatches) {
                imagesInContent += imgMatches.length;
            }
        }
    });

    return {
        articlesWithImages,
        categoriesWithIcons,
        linktreesWithPhotos,
        imagesInContent
    };
}

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// Run if script is executed directly
if (require.main === module) {
    getStorageStats();
}

module.exports = { getStorageStats };
