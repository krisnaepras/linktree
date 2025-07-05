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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
            {/* Clean Modern Background */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Subtle Dot Pattern */}
                <div className="absolute inset-0 opacity-30">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.15) 1px, transparent 0)`,
                            backgroundSize: "32px 32px"
                        }}
                    ></div>
                </div>

                {/* Minimal Geometric Shapes */}
                <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-100/40 to-green-100/40 rounded-full blur-2xl animate-float"></div>
                <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-green-100/30 to-blue-100/30 rounded-full blur-3xl animate-float-delay-1"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-purple-100/20 to-pink-100/20 rounded-full blur-xl animate-float-delay-2"></div>

                {/* Clean Lines */}
                <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-200/50 to-transparent"></div>
                <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-200/50 to-transparent"></div>

                {/* Subtle Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-blue-50/30"></div>
            </div>

            {/* Header with Auth Buttons */}
            <header className="w-full px-4 py-6 sm:px-6 lg:px-8 bg-white/90 backdrop-blur-md border-b border-gray-200/50 animate-fade-in-up relative">
                {/* Header background decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 via-white/80 to-blue-50/50 -z-10"></div>

                <div className="flex items-center justify-between relative">
                    {/* Brand Name */}
                    <div className="flex items-center">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                            LinkUMKM Bongkaran
                        </h1>
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/login"
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base px-6 py-2.5 rounded-full hover:bg-blue-50/80 border border-blue-600/80 hover:border-blue-700 transition-all duration-200 hover:scale-105 transform backdrop-blur-sm"
                        >
                            Masuk
                        </Link>
                        <Link
                            href="/register"
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm sm:text-base px-6 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 hover:-translate-y-0.5"
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
                        <span className="relative inline-block group">
                            {/* Main animated text */}
                            <span className="relative z-10 animate-text-shimmer-slow bg-gradient-to-r from-blue-600 via-green-500 to-purple-600 bg-clip-text text-transparent bg-[length:300%_100%]">
                                UMKM Bongkaran
                            </span>

                            {/* Animated underline */}
                            <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 animate-gradient-x-slow transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></span>
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
                <section className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-lg p-8 sm:p-12 mb-16 animate-fade-in-up animation-delay-600 hover:shadow-xl transition-shadow duration-500 border border-white/50">
                    {/* Section background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50/40 via-white/60 to-blue-50/40 rounded-3xl -z-10"></div>

                    <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-12 animate-fade-in-up animation-delay-800">
                        Mengapa Memilih LinkUMKM Bongkaran?
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center group hover:transform hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-1000 p-6 rounded-2xl hover:bg-white/70 backdrop-blur-sm">
                            <div className="bg-gradient-to-br from-green-100 to-green-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300 animate-bounce-slow shadow-sm">
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
                            <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition-colors duration-300">
                                Mudah Digunakan
                            </h3>
                            <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                                Interface yang sederhana dan intuitif, cocok
                                untuk semua kalangan UMKM tanpa perlu keahlian
                                teknis.
                            </p>
                        </div>

                        <div className="text-center group hover:transform hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-1200 p-6 rounded-2xl hover:bg-white/70 backdrop-blur-sm">
                            <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 animate-bounce-slow animation-delay-200 shadow-sm">
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
                            <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                                Semua Tautan dalam Satu Tempat
                            </h3>
                            <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                                Tampilkan semua tautan penting: Shopee,
                                Instagram, WhatsApp, Google Maps, dan lainnya
                                dalam satu halaman.
                            </p>
                        </div>

                        <div className="text-center group hover:transform hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-1400 p-6 rounded-2xl hover:bg-white/70 backdrop-blur-sm">
                            <div className="bg-gradient-to-br from-orange-100 to-orange-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300 animate-bounce-slow animation-delay-400 shadow-sm">
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
                            <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors duration-300">
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
                    <section className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-lg p-8 sm:p-12 mb-16 animate-fade-in-up animation-delay-1600 hover:shadow-xl transition-shadow duration-500 border border-white/50">
                        {/* Section background decoration */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/60 to-slate-50/30 rounded-3xl -z-10"></div>

                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 animate-fade-in-left animation-delay-1800">
                                Artikel Terbaru
                            </h2>
                            <Link
                                href="/articles"
                                className="text-blue-600 hover:text-blue-700 font-semibold text-lg hover:underline transition-all duration-200 animate-fade-in-right animation-delay-1800 hover:transform hover:scale-105 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200/50 hover:border-blue-300"
                            >
                                Lihat Semua →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredArticles.map(
                                (article: Article, index: number) => (
                                    <div
                                        key={article.id}
                                        className={`animate-fade-in-up hover:transform hover:scale-105 transition-all duration-300 hover:shadow-md rounded-2xl p-1 bg-gradient-to-br from-blue-100/30 to-green-100/30`}
                                        style={{
                                            animationDelay: `${
                                                2000 + index * 200
                                            }ms`
                                        }}
                                    >
                                        <div className="rounded-xl overflow-hidden bg-white/95 backdrop-blur-sm">
                                            <ArticleCard
                                                article={article}
                                                variant="homepage"
                                            />
                                        </div>
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
