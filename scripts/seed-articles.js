const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("Starting to seed articles...");

    // Check if we have any users to assign as authors
    const users = await prisma.user.findMany();
    if (users.length === 0) {
        console.log("No users found. Creating a default user...");
        await prisma.user.create({
            data: {
                name: "Admin",
                email: "admin@example.com",
                password: "hashed_password_here",
                role: "ADMIN"
            }
        });
    }

    const firstUser = await prisma.user.findFirst();
    if (!firstUser) {
        throw new Error("No user found to assign as author");
    }

    // Check if we have categories
    const categories = await prisma.articleCategory.findMany();
    if (categories.length === 0) {
        console.log(
            "No categories found. Please run the category seeding script first."
        );
        return;
    }

    // Create sample articles
    const sampleArticles = [
        {
            title: "Cara Memulai Usaha UMKM di Era Digital",
            slug: "cara-memulai-usaha-umkm-era-digital",
            content: `
                <h2>Memulai Usaha UMKM di Era Digital</h2>
                <p>Era digital telah membuka peluang besar bagi pelaku UMKM untuk mengembangkan bisnisnya. Dengan strategi yang tepat, bisnis kecil dapat bersaing dengan perusahaan besar.</p>
                
                <h3>Langkah-langkah Memulai</h3>
                <ol>
                    <li>Tentukan produk atau layanan yang akan dijual</li>
                    <li>Buat profil bisnis online yang menarik</li>
                    <li>Manfaatkan media sosial untuk promosi</li>
                    <li>Bergabung dengan platform marketplace</li>
                    <li>Berikan layanan pelanggan yang excellent</li>
                </ol>
                
                <p>Dengan konsistensi dan dedikasi, bisnis UMKM Anda dapat berkembang pesat di era digital ini.</p>
            `,
            excerpt:
                "Panduan lengkap untuk memulai dan mengembangkan usaha UMKM di era digital dengan strategi yang efektif.",
            status: "PUBLISHED",
            isFeatured: true,
            readingTime: 5,
            authorId: firstUser.id,
            categoryId: categories[0].id,
            publishedAt: new Date()
        },
        {
            title: "Tips Marketing Online untuk UMKM Pemula",
            slug: "tips-marketing-online-umkm-pemula",
            content: `
                <h2>Marketing Online untuk UMKM</h2>
                <p>Marketing online adalah kunci sukses UMKM di era digital. Dengan budget terbatas, UMKM dapat memanfaatkan berbagai platform untuk menjangkau lebih banyak pelanggan.</p>
                
                <h3>Platform Marketing yang Efektif</h3>
                <ul>
                    <li><strong>Media Sosial</strong> - Instagram, Facebook, TikTok</li>
                    <li><strong>Marketplace</strong> - Shopee, Tokopedia, Lazada</li>
                    <li><strong>WhatsApp Business</strong> - Komunikasi langsung dengan pelanggan</li>
                    <li><strong>Google My Business</strong> - Meningkatkan visibilitas lokal</li>
                </ul>
                
                <h3>Strategi Content Marketing</h3>
                <p>Buat konten yang menarik dan relevan dengan target audience. Gunakan foto produk yang berkualitas dan cerita yang menarik.</p>
            `,
            excerpt:
                "Strategi marketing online yang efektif dan mudah diterapkan untuk UMKM pemula dengan budget terbatas.",
            status: "PUBLISHED",
            isFeatured: true,
            readingTime: 4,
            authorId: firstUser.id,
            categoryId: categories[1] ? categories[1].id : categories[0].id,
            publishedAt: new Date()
        },
        {
            title: "Mengelola Keuangan UMKM dengan Baik",
            slug: "mengelola-keuangan-umkm-dengan-baik",
            content: `
                <h2>Pentingnya Pengelolaan Keuangan UMKM</h2>
                <p>Pengelolaan keuangan yang baik adalah fondasi kesuksesan bisnis UMKM. Banyak bisnis yang gagal karena tidak memiliki kontrol yang baik terhadap keuangan.</p>
                
                <h3>Prinsip Dasar Pengelolaan Keuangan</h3>
                <ol>
                    <li>Pisahkan keuangan pribadi dan bisnis</li>
                    <li>Buat catatan pemasukan dan pengeluaran harian</li>
                    <li>Tentukan harga jual yang tepat</li>
                    <li>Siapkan dana darurat untuk bisnis</li>
                    <li>Evaluasi kinerja keuangan secara berkala</li>
                </ol>
                
                <h3>Tools yang Bisa Digunakan</h3>
                <ul>
                    <li>Aplikasi pencatat keuangan</li>
                    <li>Spreadsheet sederhana</li>
                    <li>Software akuntansi untuk UMKM</li>
                </ul>
            `,
            excerpt:
                "Panduan praktis mengelola keuangan UMKM agar bisnis dapat berkembang dengan sehat dan berkelanjutan.",
            status: "PUBLISHED",
            isFeatured: false,
            readingTime: 6,
            authorId: firstUser.id,
            categoryId: categories[2] ? categories[2].id : categories[0].id,
            publishedAt: new Date()
        },
        {
            title: "Membangun Brand UMKM yang Kuat",
            slug: "membangun-brand-umkm-yang-kuat",
            content: `
                <h2>Pentingnya Brand untuk UMKM</h2>
                <p>Brand yang kuat dapat membedakan bisnis Anda dari kompetitor. Brand bukan hanya logo, tetapi keseluruhan pengalaman pelanggan dengan bisnis Anda.</p>
                
                <h3>Elemen Brand yang Penting</h3>
                <ul>
                    <li><strong>Logo dan Visual Identity</strong> - Desain yang konsisten</li>
                    <li><strong>Tone of Voice</strong> - Cara berkomunikasi dengan pelanggan</li>
                    <li><strong>Value Proposition</strong> - Keunikan yang ditawarkan</li>
                    <li><strong>Customer Experience</strong> - Pengalaman menyeluruh pelanggan</li>
                </ul>
                
                <p>Investasi dalam branding akan memberikan return yang baik dalam jangka panjang.</p>
            `,
            excerpt:
                "Strategi membangun brand UMKM yang kuat dan berkesan di mata pelanggan.",
            status: "PUBLISHED",
            isFeatured: true,
            readingTime: 5,
            authorId: firstUser.id,
            categoryId: categories[0].id,
            publishedAt: new Date()
        }
    ];

    // Create articles
    for (const article of sampleArticles) {
        const existingArticle = await prisma.article.findUnique({
            where: { slug: article.slug }
        });

        if (!existingArticle) {
            await prisma.article.create({
                data: article
            });
            console.log(`Created article: ${article.title}`);
        } else {
            console.log(`Article already exists: ${article.title}`);
        }
    }

    console.log("Articles seeding completed!");
}

main()
    .catch((e) => {
        console.error("Error seeding articles:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
