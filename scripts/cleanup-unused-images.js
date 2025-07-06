const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function cleanupUnusedImages(dryRun = false) {
    const mode = dryRun ? "DRY RUN" : "CLEANUP";
    console.log(`🧹 Starting ${mode} of unused images...`);

    if (dryRun) {
        console.log("🔍 DRY RUN MODE - Files will not be deleted, only listed");
    }

    try {
        // Define upload directories
        const uploadDirs = [
            {
                name: "Articles",
                path: path.join(process.cwd(), "public", "uploads", "articles"),
                dbCheck: checkArticleImages
            },
            {
                name: "Category Icons",
                path: path.join(
                    process.cwd(),
                    "public",
                    "uploads",
                    "category-icons"
                ),
                dbCheck: checkCategoryIcons
            },
            {
                name: "Linktree Photos",
                path: path.join(
                    process.cwd(),
                    "public",
                    "uploads",
                    "linktree-photos"
                ),
                dbCheck: checkLinktreePhotos
            }
        ];

        let totalFilesDeleted = 0;
        let totalSizeFreed = 0;

        for (const dir of uploadDirs) {
            console.log(`\n📁 Checking ${dir.name}...`);

            if (!fs.existsSync(dir.path)) {
                console.log(`   ⚠️  Directory doesn't exist: ${dir.path}`);
                continue;
            }

            const files = fs.readdirSync(dir.path).filter((file) => {
                // Skip .gitkeep files
                return file !== ".gitkeep";
            });

            if (files.length === 0) {
                console.log(`   ✅ Directory is empty`);
                continue;
            }

            console.log(`   📊 Found ${files.length} files`);

            // Get used files from database
            const usedFiles = await dir.dbCheck();

            // Also check for images in article content if this is articles directory
            if (dir.name === "Articles") {
                const contentImages = await checkArticleContentImages();
                usedFiles.push(...contentImages);
            }

            console.log(
                `   📋 ${usedFiles.length} files are referenced in database`
            );

            // Check each file
            for (const file of files) {
                const filePath = path.join(dir.path, file);
                const relativePath = `/uploads/${path.basename(
                    dir.path
                )}/${file}`;

                // Check if file is used in database
                const isUsed = usedFiles.some(
                    (usedFile) =>
                        usedFile.includes(file) ||
                        usedFile.includes(relativePath)
                );

                if (!isUsed) {
                    try {
                        const stats = fs.statSync(filePath);
                        const fileSize = stats.size;

                        if (dryRun) {
                            console.log(
                                `   🔍 Would delete: ${file} (${formatBytes(
                                    fileSize
                                )})`
                            );
                        } else {
                            fs.unlinkSync(filePath);
                            console.log(
                                `   🗑️  Deleted: ${file} (${formatBytes(
                                    fileSize
                                )})`
                            );
                        }

                        totalFilesDeleted++;
                        totalSizeFreed += fileSize;
                    } catch (error) {
                        console.error(
                            `   ❌ Error ${
                                dryRun ? "checking" : "deleting"
                            } ${file}:`,
                            error.message
                        );
                    }
                } else {
                    console.log(`   ✅ Kept: ${file} (in use)`);
                }
            }
        }

        console.log(`\n📊 ${mode} Summary:`);
        console.log(
            `   🗑️  Files ${
                dryRun ? "to be deleted" : "deleted"
            }: ${totalFilesDeleted}`
        );
        console.log(
            `   💾 Space ${dryRun ? "to be freed" : "freed"}: ${formatBytes(
                totalSizeFreed
            )}`
        );
        console.log(`   ✅ ${mode} completed!`);

        if (dryRun && totalFilesDeleted > 0) {
            console.log(`\n💡 To actually delete these files, run:`);
            console.log(`   node scripts/cleanup-unused-images.js --delete`);
        }
    } catch (error) {
        console.error("❌ Error during cleanup:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Check article images
async function checkArticleImages() {
    const articles = await prisma.article.findMany({
        where: {
            featuredImage: {
                not: null
            }
        },
        select: {
            featuredImage: true
        }
    });

    return articles
        .map((article) => article.featuredImage)
        .filter((image) => image && image.startsWith("/uploads/articles/"));
}

// Check category icons
async function checkCategoryIcons() {
    const categories = await prisma.category.findMany({
        where: {
            icon: {
                not: null
            }
        },
        select: {
            icon: true
        }
    });

    return categories
        .map((category) => category.icon)
        .filter((icon) => icon && icon.startsWith("/uploads/category-icons/"));
}

// Check linktree photos
async function checkLinktreePhotos() {
    const linktrees = await prisma.linktree.findMany({
        where: {
            photo: {
                not: null
            }
        },
        select: {
            photo: true
        }
    });

    return linktrees
        .map((linktree) => linktree.photo)
        .filter(
            (photo) => photo && photo.startsWith("/uploads/linktree-photos/")
        );
}

// Check for images in article content (Rich Text Editor)
async function checkArticleContentImages() {
    const articles = await prisma.article.findMany({
        select: {
            content: true
        }
    });

    const imageUrls = [];

    articles.forEach((article) => {
        if (article.content) {
            // Extract image URLs from HTML content
            const imgRegex = /<img[^>]+src="([^">]+)"/g;
            let match;

            while ((match = imgRegex.exec(article.content)) !== null) {
                const src = match[1];
                if (src.startsWith("/uploads/")) {
                    imageUrls.push(src);
                }
            }
        }
    });

    return imageUrls;
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

// Run cleanup if script is executed directly
if (require.main === module) {
    // Check command line arguments
    const args = process.argv.slice(2);
    const shouldDelete = args.includes("--delete") || args.includes("-d");

    if (!shouldDelete) {
        console.log("🔍 Running in DRY RUN mode (no files will be deleted)");
        console.log("💡 Use --delete or -d flag to actually delete files\n");
    }

    cleanupUnusedImages(!shouldDelete);
}

module.exports = { cleanupUnusedImages };
