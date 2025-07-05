import Image from "next/image";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import { prisma } from "@/lib/prisma";

// Article type
type Article = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
    publishedAt: string | null;
    readingTime: number | null;
    isFeatured: boolean;
    author: {
        name: string;
    };
    category: {
        name: string;
        slug: string;
    } | null;
    _count: {
        views: number;
    };
};

// Get featured articles directly from database
async function getFeaturedArticles(): Promise<Article[]> {
    try {
        const articles = await prisma.article.findMany({
            where: {
                status: "PUBLISHED",
                isFeatured: true
            },
            include: {
                author: {
                    select: {
                        name: true
                    }
                },
                category: {
                    select: {
                        name: true,
                        slug: true
                    }
                },
                _count: {
                    select: {
                        views: true
                    }
                }
            },
            orderBy: {
                publishedAt: "desc"
            },
            take: 3
        });

        return articles.map((article) => ({
            ...article,
            publishedAt: article.publishedAt?.toISOString() || null
        }));
    } catch (error) {
        console.error("Error fetching featured articles:", error);
        return [];
    }
}

export default async function Home() {
    const featuredArticles = await getFeaturedArticles();
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="absolute top-40 right-20 w-1 h-1 bg-green-400 rounded-full animate-pulse animation-delay-1000"></div>
                <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse animation-delay-2000"></div>
                <div className="absolute bottom-20 right-10 w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-1500"></div>
            </div>

            {/* Header with Auth Buttons */}
            <header className="w-full px-4 py-6 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-sm border-b border-gray-100 animate-fade-in-up">
                <div className="flex items-center justify-between">
                    {/* Brand Name */}
                    <div className="flex items-center">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                            LinkUMKM Bongkaran
                        </h1>
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center space-x-2">
                        <Link
                            href="/login"
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base px-6 py-2.5 rounded-full hover:bg-blue-50 border border-blue-600 hover:border-blue-700 transition-all duration-200 hover:scale-105 transform"
                        >
                            Masuk
                        </Link>
                        <Link
                            href="/register"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base px-6 py-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 hover:-translate-y-0.5"
                        >
                            Daftar
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="text-center mb-16 relative">
                    {/* Floating Background Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-float"></div>
                        <div className="absolute top-32 right-16 w-16 h-16 bg-green-200 rounded-full opacity-20 animate-float-delay-1"></div>
                        <div className="absolute bottom-20 left-20 w-24 h-24 bg-orange-200 rounded-full opacity-20 animate-float-delay-2"></div>
                        <div className="absolute bottom-32 right-10 w-12 h-12 bg-purple-200 rounded-full opacity-20 animate-float-delay-3"></div>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-fade-in-up">
                        Satu Tautan untuk{" "}
                        <span className="text-blue-600 relative">
                            UMKM Bongkaran
                            <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-green-400 animate-gradient-x"></span>
                        </span>
                    </h1>
                    <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
                        Bantu UMKM di Surabaya tampil online dengan mudah dan
                        cepat.
                    </p>

                    {/* Animated CTA Button */}
                    <div className="animate-fade-in-up animation-delay-400">
                        <Link
                            href="/register"
                            className="inline-block bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-2 hover:scale-105 animate-pulse-slow"
                        >
                            🚀 Mulai Sekarang - Gratis!
                        </Link>
                    </div>
                </div>

                {/* Features Section */}
                <section className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 mb-16 animate-fade-in-up animation-delay-600 hover:shadow-2xl transition-shadow duration-500">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12 animate-fade-in-up animation-delay-800">
                        Mengapa Memilih LinkUMKM Bongkaran?
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center group hover:transform hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-1000">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors duration-300 animate-bounce-slow">
                                <svg
                                    className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform duration-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300">
                                Mudah Digunakan
                            </h3>
                            <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                                Interface yang sederhana dan intuitif, cocok
                                untuk semua kalangan UMKM tanpa perlu keahlian
                                teknis.
                            </p>
                        </div>

                        <div className="text-center group hover:transform hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-1200">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300 animate-bounce-slow animation-delay-200">
                                <svg
                                    className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform duration-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                                Semua Tautan dalam Satu Tempat
                            </h3>
                            <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                                Tampilkan semua tautan penting: Shopee,
                                Instagram, WhatsApp, Google Maps, dan lainnya
                                dalam satu halaman.
                            </p>
                        </div>

                        <div className="text-center group hover:transform hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-1400">
                            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors duration-300 animate-bounce-slow animation-delay-400">
                                <svg
                                    className="w-8 h-8 text-orange-600 group-hover:scale-110 transition-transform duration-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300">
                                Gratis & Terpercaya
                            </h3>
                            <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                                Layanan gratis yang dikelola oleh Kelurahan
                                Bongkaran untuk mendukung kemajuan UMKM lokal.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Featured Articles Section */}
                {featuredArticles.length > 0 && (
                    <section className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 mb-16 animate-fade-in-up animation-delay-1600 hover:shadow-2xl transition-shadow duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 animate-fade-in-left animation-delay-1800">
                                Artikel Terbaru
                            </h2>
                            <Link
                                href="/articles"
                                className="text-blue-600 hover:text-blue-700 font-semibold text-lg hover:underline transition-all duration-200 animate-fade-in-right animation-delay-1800 hover:transform hover:scale-105"
                            >
                                Lihat Semua →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredArticles.map(
                                (article: Article, index: number) => (
                                    <div
                                        key={article.id}
                                        className={`animate-fade-in-up hover:transform hover:scale-105 transition-all duration-300 hover:shadow-lg`}
                                        style={{
                                            animationDelay: `${
                                                2000 + index * 200
                                            }ms`
                                        }}
                                    >
                                        <ArticleCard
                                            article={article}
                                            variant="homepage"
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </section>
                )}

                {/* Call to Action */}
                <section className="text-center bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden animate-fade-in-up animation-delay-2400 hover:shadow-2xl transition-shadow duration-500">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent animate-pulse-slow"></div>
                        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
                        <div className="absolute bottom-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float-delay-1"></div>
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 animate-fade-in-up animation-delay-2600">
                            Siap Memulai Perjalanan Digital Anda?
                        </h2>
                        <p className="text-xl mb-8 opacity-90 animate-fade-in-up animation-delay-2800">
                            Bergabunglah dengan ratusan UMKM Bongkaran yang
                            telah merasakan manfaatnya
                        </p>
                        <div className="animate-fade-in-up animation-delay-3000">
                            <Link
                                href="/register"
                                className="bg-white hover:bg-gray-100 text-blue-600 hover:text-blue-700 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-2 hover:scale-105 inline-block"
                            >
                                ✨ Mulai Sekarang - Gratis!
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 mt-16 animate-fade-in-up animation-delay-3200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* About Section */}
                        <div className="md:col-span-1 animate-fade-in-up animation-delay-3400">
                            <h3 className="text-lg font-semibold mb-4 hover:text-blue-400 transition-colors duration-300">
                                LinkUMKM Bongkaran
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed hover:text-gray-300 transition-colors duration-300">
                                Platform digital untuk membantu UMKM di
                                Kelurahan Bongkaran, Surabaya tampil online
                                dengan mudah dan profesional.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div className="md:col-span-1 animate-fade-in-up animation-delay-3600">
                            <h3 className="text-lg font-semibold mb-4 hover:text-blue-400 transition-colors duration-300">
                                Tautan Cepat
                            </h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link
                                        href="/articles"
                                        className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block"
                                    >
                                        → Artikel
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/register"
                                        className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block"
                                    >
                                        → Daftar
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/login"
                                        className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block"
                                    >
                                        → Masuk
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/dashboard"
                                        className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block"
                                    >
                                        → Dashboard
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="md:col-span-1 animate-fade-in-up animation-delay-3800">
                            <h3 className="text-lg font-semibold mb-4 hover:text-blue-400 transition-colors duration-300">
                                Kontak
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li className="hover:text-gray-300 transition-colors duration-300">
                                    📍 Kelurahan Bongkaran
                                </li>
                                <li className="hover:text-gray-300 transition-colors duration-300">
                                    🏙️ Kota Surabaya
                                </li>
                                <li className="hover:text-gray-300 transition-colors duration-300">
                                    🌏 Jawa Timur, Indonesia
                                </li>
                                <li className="hover:text-gray-300 transition-colors duration-300">
                                    📧 info@linkumkm-bongkaran.id
                                </li>
                            </ul>
                        </div>

                        {/* Partner Logos */}
                        <div className="md:col-span-1 animate-fade-in-up animation-delay-4000">
                            <h3 className="text-lg font-semibold mb-4 hover:text-blue-400 transition-colors duration-300">
                                Partner
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3 hover:transform hover:scale-105 transition-all duration-300 group">
                                    <Image
                                        src="/images/logos/logo_surabaya.png"
                                        alt="Logo Kota Surabaya"
                                        width={40}
                                        height={40}
                                        className="w-8 h-8 rounded group-hover:rotate-12 transition-transform duration-300"
                                    />
                                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors duration-300">
                                        Kota Surabaya
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3 hover:transform hover:scale-105 transition-all duration-300 group">
                                    <Image
                                        src="/images/logos/logo_upnjatim.png"
                                        alt="Logo UPN Jawa Timur"
                                        width={40}
                                        height={40}
                                        className="w-8 h-8 rounded group-hover:rotate-12 transition-transform duration-300"
                                    />
                                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors duration-300">
                                        UPN Jawa Timur
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3 hover:transform hover:scale-105 transition-all duration-300 group">
                                    <Image
                                        src="/images/logos/logo_kkn15bongkaran.png"
                                        alt="Logo KKN 15 Bongkaran"
                                        width={40}
                                        height={40}
                                        className="w-8 h-8 rounded group-hover:rotate-12 transition-transform duration-300"
                                    />
                                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors duration-300">
                                        KKN 15 Bongkaran
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Footer */}
                    <div className="border-t border-gray-800 mt-8 pt-6 animate-fade-in-up animation-delay-4200">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <p className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-300">
                                © 2025 LinkUMKM Bongkaran. Dibuat dengan ❤️ oleh
                                KKN UPN di Surabaya.
                            </p>
                            <div className="flex items-center space-x-6">
                                <Link
                                    href="/privacy"
                                    className="text-sm text-gray-400 hover:text-white hover:underline transition-all duration-300"
                                >
                                    Kebijakan Privasi
                                </Link>
                                <Link
                                    href="/terms"
                                    className="text-sm text-gray-400 hover:text-white hover:underline transition-all duration-300"
                                >
                                    Syarat & Ketentuan
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
