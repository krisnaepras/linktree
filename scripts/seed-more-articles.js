const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("Starting to seed more articles...");

    // Check if we have any users to assign as authors
    const users = await prisma.user.findMany();
    if (users.length === 0) {
        console.log("No users found. Please create users first.");
        return;
    }

    const firstUser = users[0];

    // Check if we have categories
    const categories = await prisma.articleCategory.findMany();
    if (categories.length === 0) {
        console.log(
            "No categories found. Please run the category seeding script first."
        );
        return;
    }

    // Create more sample articles for pagination
    const moreArticles = [
        {
            title: "Strategi Pemasaran Media Sosial untuk UMKM",
            slug: "strategi-pemasaran-media-sosial-umkm",
            content: `
                <h2>Pemasaran Media Sosial untuk UMKM</h2>
                <p>Media sosial adalah platform yang sangat efektif untuk UMKM dalam mempromosikan produk dan layanan mereka. Dengan strategi yang tepat, UMKM dapat menjangkau audiens yang lebih luas dengan biaya yang relatif rendah.</p>
                
                <h3>Platform Media Sosial yang Cocok untuk UMKM</h3>
                <ul>
                    <li><strong>Instagram</strong> - Perfect untuk produk visual</li>
                    <li><strong>Facebook</strong> - Jangkauan luas dan targeting yang baik</li>
                    <li><strong>TikTok</strong> - Engagement tinggi untuk konten kreatif</li>
                    <li><strong>YouTube</strong> - Untuk tutorial dan review produk</li>
                </ul>
                
                <h3>Tips Konten yang Engaging</h3>
                <p>Buat konten yang autentik dan relatable. Tunjukkan proses pembuatan produk, testimoni pelanggan, dan cerita di balik brand Anda.</p>
            `,
            excerpt:
                "Panduan lengkap memanfaatkan media sosial untuk strategi pemasaran UMKM yang efektif.",
            status: "PUBLISHED",
            isFeatured: false,
            readingTime: 7,
            authorId: firstUser.id,
            categoryId:
                categories.find((c) => c.slug === "marketing")?.id ||
                categories[0].id,
            publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
            title: "Membangun Toko Online untuk UMKM",
            slug: "membangun-toko-online-umkm",
            content: `
                <h2>Toko Online untuk UMKM</h2>
                <p>Memiliki toko online adalah keharusan di era digital ini. Dengan toko online, UMKM dapat menjual produk 24/7 tanpa batasan geografis.</p>
                
                <h3>Platform untuk Membuat Toko Online</h3>
                <ul>
                    <li><strong>Website sendiri</strong> - Kontrol penuh atas brand</li>
                    <li><strong>Marketplace</strong> - Shopee, Tokopedia, Lazada</li>
                    <li><strong>Social Commerce</strong> - Facebook Shop, Instagram Shop</li>
                    <li><strong>WhatsApp Business</strong> - Katalog produk</li>
                </ul>
                
                <h3>Faktor Penting dalam Toko Online</h3>
                <ol>
                    <li>Foto produk yang berkualitas</li>
                    <li>Deskripsi produk yang detail</li>
                    <li>Sistem pembayaran yang aman</li>
                    <li>Layanan pelanggan yang responsif</li>
                </ol>
            `,
            excerpt:
                "Panduan membangun toko online yang sukses untuk UMKM dengan berbagai platform yang tersedia.",
            status: "PUBLISHED",
            isFeatured: false,
            readingTime: 8,
            authorId: firstUser.id,
            categoryId:
                categories.find((c) => c.slug === "teknologi")?.id ||
                categories[0].id,
            publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
            title: "Analisis Kompetitor untuk UMKM",
            slug: "analisis-kompetitor-umkm",
            content: `
                <h2>Mengapa Analisis Kompetitor Penting</h2>
                <p>Memahami kompetitor adalah kunci sukses dalam bisnis. Dengan analisis yang tepat, UMKM dapat menemukan peluang dan mengembangkan strategi yang lebih efektif.</p>
                
                <h3>Cara Melakukan Analisis Kompetitor</h3>
                <ol>
                    <li>Identifikasi siapa kompetitor langsung dan tidak langsung</li>
                    <li>Analisis produk dan layanan mereka</li>
                    <li>Pelajari strategi marketing yang digunakan</li>
                    <li>Bandingkan harga dan value proposition</li>
                    <li>Identifikasi kekuatan dan kelemahan</li>
                </ol>
                
                <h3>Tools yang Bisa Digunakan</h3>
                <ul>
                    <li>Google Alerts untuk monitoring</li>
                    <li>Social media monitoring</li>
                    <li>Survey pelanggan</li>
                    <li>Mystery shopping</li>
                </ul>
            `,
            excerpt:
                "Cara melakukan analisis kompetitor yang efektif untuk membantu UMKM mengembangkan strategi bisnis.",
            status: "PUBLISHED",
            isFeatured: false,
            readingTime: 6,
            authorId: firstUser.id,
            categoryId:
                categories.find((c) => c.slug === "bisnis")?.id ||
                categories[0].id,
            publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        },
        {
            title: "Manajemen Inventory untuk UMKM",
            slug: "manajemen-inventory-umkm",
            content: `
                <h2>Pentingnya Manajemen Inventory</h2>
                <p>Manajemen inventory yang baik dapat menghemat biaya dan meningkatkan efisiensi bisnis. UMKM perlu memiliki sistem yang tepat untuk mengontrol stok barang.</p>
                
                <h3>Prinsip Dasar Manajemen Inventory</h3>
                <ul>
                    <li><strong>First In First Out (FIFO)</strong> - Barang lama dijual terlebih dahulu</li>
                    <li><strong>Safety Stock</strong> - Cadangan untuk antisipasi permintaan mendadak</li>
                    <li><strong>Reorder Point</strong> - Titik untuk melakukan pemesanan ulang</li>
                    <li><strong>ABC Analysis</strong> - Kategorisasi barang berdasarkan nilai</li>
                </ul>
                
                <h3>Tools Sederhana untuk UMKM</h3>
                <p>Gunakan aplikasi inventory management yang mudah dan terjangkau. Bahkan spreadsheet sederhana bisa sangat membantu jika dikelola dengan baik.</p>
            `,
            excerpt:
                "Panduan praktis manajemen inventory untuk UMKM agar efisien dan menghemat biaya operasional.",
            status: "PUBLISHED",
            isFeatured: false,
            readingTime: 5,
            authorId: firstUser.id,
            categoryId:
                categories.find((c) => c.slug === "bisnis")?.id ||
                categories[0].id,
            publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
        },
        {
            title: "Customer Service Excellence untuk UMKM",
            slug: "customer-service-excellence-umkm",
            content: `
                <h2>Customer Service sebagai Competitive Advantage</h2>
                <p>Pelayanan pelanggan yang excellent adalah salah satu cara terbaik untuk UMKM bersaing dengan perusahaan besar. Pelanggan yang puas akan menjadi brand ambassador terbaik.</p>
                
                <h3>Prinsip Customer Service yang Baik</h3>
                <ol>
                    <li>Responsif terhadap pertanyaan dan keluhan</li>
                    <li>Empati terhadap masalah pelanggan</li>
                    <li>Solusi yang cepat dan efektif</li>
                    <li>Follow up untuk memastikan kepuasan</li>
                    <li>Personalisasi dalam komunikasi</li>
                </ol>
                
                <h3>Channel Customer Service Modern</h3>
                <ul>
                    <li>WhatsApp Business untuk komunikasi langsung</li>
                    <li>Live chat di website</li>
                    <li>Social media monitoring</li>
                    <li>Email support</li>
                    <li>Video call untuk konsultasi</li>
                </ul>
            `,
            excerpt:
                "Strategi memberikan pelayanan pelanggan terbaik untuk UMKM agar menciptakan loyalitas dan rekomendasi.",
            status: "PUBLISHED",
            isFeatured: false,
            readingTime: 6,
            authorId: firstUser.id,
            categoryId:
                categories.find((c) => c.slug === "bisnis")?.id ||
                categories[0].id,
            publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        },
        {
            title: "Strategi Pricing untuk UMKM",
            slug: "strategi-pricing-umkm",
            content: `
                <h2>Pentingnya Strategi Pricing yang Tepat</h2>
                <p>Penetapan harga yang tepat sangat crucial untuk kesuksesan bisnis UMKM. Harga yang terlalu tinggi bisa mengurangi penjualan, sedangkan harga yang terlalu rendah bisa mengurangi profit.</p>
                
                <h3>Metode Penetapan Harga</h3>
                <ol>
                    <li><strong>Cost-Plus Pricing</strong> - Harga pokok + margin keuntungan</li>
                    <li><strong>Competition-Based Pricing</strong> - Berdasarkan harga kompetitor</li>
                    <li><strong>Value-Based Pricing</strong> - Berdasarkan nilai yang diberikan</li>
                    <li><strong>Psychological Pricing</strong> - Mempengaruhi persepsi pelanggan</li>
                </ol>
                
                <h3>Faktor yang Mempengaruhi Pricing</h3>
                <ul>
                    <li>Biaya produksi dan operasional</li>
                    <li>Target market dan daya beli</li>
                    <li>Positioning brand</li>
                    <li>Kondisi pasar dan kompetisi</li>
                    <li>Tujuan bisnis jangka pendek dan panjang</li>
                </ul>
            `,
            excerpt:
                "Panduan lengkap strategi penetapan harga yang optimal untuk UMKM agar tetap kompetitif dan profitable.",
            status: "PUBLISHED",
            isFeatured: false,
            readingTime: 7,
            authorId: firstUser.id,
            categoryId:
                categories.find((c) => c.slug === "keuangan")?.id ||
                categories[0].id,
            publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
        },
        {
            title: "Membangun Tim yang Solid untuk UMKM",
            slug: "membangun-tim-solid-umkm",
            content: `
                <h2>Importance of Team Building</h2>
                <p>Seiring berkembangnya bisnis, UMKM perlu membangun tim yang solid. Tim yang kompak dan termotivasi adalah aset terbesar dalam bisnis.</p>
                
                <h3>Karakteristik Tim yang Baik</h3>
                <ul>
                    <li><strong>Komunikasi yang terbuka</strong> - Transparansi dalam berbagi informasi</li>
                    <li><strong>Saling mendukung</strong> - Membantu satu sama lain</li>
                    <li><strong>Komitmen bersama</strong> - Tujuan yang sama</li>
                    <li><strong>Fleksibilitas</strong> - Adaptasi terhadap perubahan</li>
                </ul>
                
                <h3>Tips Membangun Tim UMKM</h3>
                <ol>
                    <li>Rekrut orang yang sesuai dengan budaya kerja</li>
                    <li>Berikan training dan development</li>
                    <li>Ciptakan lingkungan kerja yang positif</li>
                    <li>Apresiasi kontribusi setiap anggota tim</li>
                    <li>Libatkan tim dalam pengambilan keputusan</li>
                </ol>
            `,
            excerpt:
                "Strategi membangun dan mengembangkan tim yang solid untuk mendukung pertumbuhan UMKM.",
            status: "PUBLISHED",
            isFeatured: false,
            readingTime: 5,
            authorId: firstUser.id,
            categoryId:
                categories.find((c) => c.slug === "motivasi")?.id ||
                categories[0].id,
            publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        },
        {
            title: "Diversifikasi Produk untuk UMKM",
            slug: "diversifikasi-produk-umkm",
            content: `
                <h2>Mengapa Diversifikasi Produk Penting</h2>
                <p>Diversifikasi produk membantu UMKM mengurangi risiko dan meningkatkan revenue stream. Dengan variasi produk, bisnis menjadi lebih resilient terhadap perubahan pasar.</p>
                
                <h3>Jenis Diversifikasi</h3>
                <ul>
                    <li><strong>Horizontal Diversification</strong> - Produk baru untuk market existing</li>
                    <li><strong>Vertical Diversification</strong> - Integrasi supply chain</li>
                    <li><strong>Concentric Diversification</strong> - Produk related dengan teknologi sama</li>
                    <li><strong>Conglomerate Diversification</strong> - Produk completely different</li>
                </ul>
                
                <h3>Strategi Diversifikasi yang Aman</h3>
                <ol>
                    <li>Mulai dengan produk yang related dengan existing produk</li>
                    <li>Lakukan riset pasar yang mendalam</li>
                    <li>Test market dengan skala kecil</li>
                    <li>Pastikan resources mencukupi</li>
                    <li>Pertahankan kualitas produk utama</li>
                </ol>
            `,
            excerpt:
                "Panduan diversifikasi produk yang aman dan efektif untuk UMKM dalam mengembangkan bisnis.",
            status: "PUBLISHED",
            isFeatured: false,
            readingTime: 6,
            authorId: firstUser.id,
            categoryId:
                categories.find((c) => c.slug === "bisnis")?.id ||
                categories[0].id,
            publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
        },
        {
            title: "Sustainable Business untuk UMKM",
            slug: "sustainable-business-umkm",
            content: `
                <h2>Bisnis Berkelanjutan untuk UMKM</h2>
                <p>Sustainability bukan hanya trend, tetapi necessity. UMKM yang menerapkan praktik bisnis berkelanjutan akan lebih resilient dan attractive bagi conscious consumers.</p>
                
                <h3>Pilar Sustainability</h3>
                <ul>
                    <li><strong>Environmental</strong> - Ramah lingkungan</li>
                    <li><strong>Social</strong> - Memberikan dampak positif ke masyarakat</li>
                    <li><strong>Economic</strong> - Profitable dan sustainable</li>
                </ul>
                
                <h3>Implementasi Sustainable Practices</h3>
                <ol>
                    <li>Gunakan bahan baku yang environmentally friendly</li>
                    <li>Optimasi penggunaan energi dan resources</li>
                    <li>Reduce, reuse, recycle dalam operasional</li>
                    <li>Support local suppliers dan communities</li>
                    <li>Transparansi dalam business practices</li>
                </ol>
                
                <h3>Benefits of Sustainable Business</h3>
                <p>Selain memberikan dampak positif, sustainable business juga dapat meningkatkan brand reputation, customer loyalty, dan cost efficiency.</p>
            `,
            excerpt:
                "Panduan implementasi praktik bisnis berkelanjutan untuk UMKM yang memberikan dampak positif.",
            status: "PUBLISHED",
            isFeatured: false,
            readingTime: 7,
            authorId: firstUser.id,
            categoryId:
                categories.find((c) => c.slug === "bisnis")?.id ||
                categories[0].id,
            publishedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) // 9 days ago
        },
        {
            title: "Membangun Network untuk UMKM",
            slug: "membangun-network-umkm",
            content: `
                <h2>Pentingnya Network dalam Bisnis</h2>
                <p>Network yang kuat dapat membuka banyak peluang bisnis untuk UMKM. Melalui networking, UMKM dapat memperoleh pelanggan baru, partner bisnis, dan knowledge sharing.</p>
                
                <h3>Jenis Network yang Penting</h3>
                <ul>
                    <li><strong>Industry Network</strong> - Sesama pelaku industri</li>
                    <li><strong>Customer Network</strong> - Pelanggan dan prospek</li>
                    <li><strong>Supplier Network</strong> - Pemasok dan vendor</li>
                    <li><strong>Government Network</strong> - Pemerintah dan regulator</li>
                    <li><strong>Professional Network</strong> - Konsultan dan expert</li>
                </ul>
                
                <h3>Strategi Networking yang Efektif</h3>
                <ol>
                    <li>Ikuti event industri dan business gathering</li>
                    <li>Join komunitas bisnis dan asosiasi</li>
                    <li>Aktif di social media profesional</li>
                    <li>Berikan value sebelum meminta bantuan</li>
                    <li>Maintain relationship secara konsisten</li>
                </ol>
                
                <h3>Digital Networking</h3>
                <p>Manfaatkan platform digital seperti LinkedIn, Facebook Groups, dan forum bisnis online untuk memperluas network.</p>
            `,
            excerpt:
                "Strategi membangun dan memelihara network bisnis yang kuat untuk mendukung pertumbuhan UMKM.",
            status: "PUBLISHED",
            isFeatured: false,
            readingTime: 6,
            authorId: firstUser.id,
            categoryId:
                categories.find((c) => c.slug === "bisnis")?.id ||
                categories[0].id,
            publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
        },
        {
            title: "Crisis Management untuk UMKM",
            slug: "crisis-management-umkm",
            content: `
                <h2>Mempersiapkan Diri Menghadapi Krisis</h2>
                <p>Krisis dapat terjadi kapan saja dan UMKM perlu memiliki strategi untuk menghadapinya. Dengan persiapan yang baik, bisnis dapat survive dan bahkan thrive setelah krisis.</p>
                
                <h3>Jenis Krisis yang Mungkin Dihadapi</h3>
                <ul>
                    <li><strong>Economic Crisis</strong> - Resesi, inflasi</li>
                    <li><strong>Health Crisis</strong> - Pandemi, wabah</li>
                    <li><strong>Natural Disaster</strong> - Bencana alam</li>
                    <li><strong>Technology Crisis</strong> - Cyber attack, system failure</li>
                    <li><strong>Reputation Crisis</strong> - Negative publicity</li>
                </ul>
                
                <h3>Crisis Management Plan</h3>
                <ol>
                    <li>Identifikasi potential risks dan vulnerabilities</li>
                    <li>Develop contingency plans untuk berbagai skenario</li>
                    <li>Establish crisis communication protocol</li>
                    <li>Build emergency fund dan insurance</li>
                    <li>Train tim untuk crisis response</li>
                </ol>
                
                <h3>Recovery Strategies</h3>
                <p>Setelah krisis, focus pada recovery dan learning. Evaluasi response, adapt business model, dan strengthen resilience untuk masa depan.</p>
            `,
            excerpt:
                "Panduan lengkap crisis management untuk UMKM agar dapat bertahan dan bangkit dari berbagai krisis.",
            status: "PUBLISHED",
            isFeatured: false,
            readingTime: 8,
            authorId: firstUser.id,
            categoryId:
                categories.find((c) => c.slug === "bisnis")?.id ||
                categories[0].id,
            publishedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000) // 11 days ago
        },
        {
            title: "Innovation dalam UMKM",
            slug: "innovation-dalam-umkm",
            content: `
                <h2>Mengapa Innovation Penting untuk UMKM</h2>
                <p>Innovation adalah kunci untuk tetap relevan dan kompetitif. UMKM yang innovative dapat menemukan peluang baru dan memberikan value yang lebih baik kepada pelanggan.</p>
                
                <h3>Jenis Innovation</h3>
                <ul>
                    <li><strong>Product Innovation</strong> - Produk baru atau improved</li>
                    <li><strong>Process Innovation</strong> - Cara baru dalam operasional</li>
                    <li><strong>Service Innovation</strong> - Layanan yang lebih baik</li>
                    <li><strong>Business Model Innovation</strong> - Cara berbeda dalam berbisnis</li>
                </ul>
                
                <h3>Mendorong Innovation Culture</h3>
                <ol>
                    <li>Encourage experimentation dan risk-taking</li>
                    <li>Listen to customer feedback dan market trends</li>
                    <li>Invest in learning dan development</li>
                    <li>Collaborate dengan external partners</li>
                    <li>Celebrate success dan learn from failures</li>
                </ol>
                
                <h3>Innovation yang Terjangkau</h3>
                <p>Innovation tidak selalu membutuhkan investasi besar. Simple improvements dalam proses atau layanan juga dapat memberikan dampak signifikan.</p>
            `,
            excerpt:
                "Strategi mengembangkan budaya innovation dalam UMKM untuk meningkatkan daya saing dan pertumbuhan.",
            status: "PUBLISHED",
            isFeatured: false,
            readingTime: 6,
            authorId: firstUser.id,
            categoryId:
                categories.find((c) => c.slug === "bisnis")?.id ||
                categories[0].id,
            publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) // 12 days ago
        }
    ];

    // Create articles
    for (const article of moreArticles) {
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

    console.log("More articles seeding completed!");
}

main()
    .catch((e) => {
        console.error("Error seeding more articles:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
