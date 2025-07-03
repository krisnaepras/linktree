import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    // Seed Categories
    const categories = [
        { name: "Social Media", icon: "fab fa-share-alt" },
        { name: "Website", icon: "fas fa-globe" },
        { name: "E-commerce", icon: "fas fa-shopping-cart" },
        { name: "Contact", icon: "fas fa-address-book" },
        { name: "Portfolio", icon: "fas fa-briefcase" },
        { name: "Blog", icon: "fas fa-blog" },
        { name: "Video", icon: "fas fa-video" },
        { name: "Music", icon: "fas fa-music" },
        { name: "Other", icon: "fas fa-ellipsis-h" }
    ];

    console.log("Seeding categories...");
    for (const category of categories) {
        await prisma.category.upsert({
            where: { name: category.name },
            update: { icon: category.icon },
            create: category
        });
    }

    // Seed Admin User
    const hashedPassword = await bcrypt.hash("admin123", 10);

    console.log("Seeding admin user...");
    await prisma.user.upsert({
        where: { email: "admin@linktree.com" },
        update: {},
        create: {
            name: "Admin User",
            email: "admin@linktree.com",
            password: hashedPassword,
            role: "ADMIN"
        }
    });

    // Seed Test User
    const testUserPassword = await bcrypt.hash("user123", 10);

    console.log("Seeding test user...");
    const testUser = await prisma.user.upsert({
        where: { email: "user@test.com" },
        update: {},
        create: {
            name: "Test User",
            email: "user@test.com",
            password: testUserPassword,
            role: "USER"
        }
    });

    // Seed Sample Linktree
    console.log("Seeding sample linktree...");
    const socialMediaCategory = await prisma.category.findFirst({
        where: { name: "Social Media" }
    });

    const websiteCategory = await prisma.category.findFirst({
        where: { name: "Website" }
    });

    if (socialMediaCategory && websiteCategory) {
        const sampleLinktree = await prisma.linktree.create({
            data: {
                userId: testUser.id,
                title: "My Awesome Links",
                slug: "my-awesome-links",
                photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
                isActive: true
            }
        });

        // Seed Sample Links
        console.log("Seeding sample links...");
        await prisma.detailLinktree.createMany({
            data: [
                {
                    linktreeId: sampleLinktree.id,
                    categoryId: socialMediaCategory.id,
                    title: "Instagram",
                    url: "https://instagram.com/username",
                    sortOrder: 1,
                    isVisible: true
                },
                {
                    linktreeId: sampleLinktree.id,
                    categoryId: socialMediaCategory.id,
                    title: "Twitter",
                    url: "https://twitter.com/username",
                    sortOrder: 2,
                    isVisible: true
                },
                {
                    linktreeId: sampleLinktree.id,
                    categoryId: websiteCategory.id,
                    title: "My Website",
                    url: "https://mywebsite.com",
                    sortOrder: 3,
                    isVisible: true
                }
            ]
        });
    }

    console.log("Seeding completed!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
