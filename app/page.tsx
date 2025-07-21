import Image from "next/image";
import Link from "next/link";
import { getAppName } from "@/lib/utils";
import ArticleCard from "@/components/ArticleCard";
import HomePageRedirect from "@/components/HomePageRedirect";
import { prisma } from "@/lib/prisma";
import { Icon } from "@iconify/react";

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
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 relative overflow-hidden">
            {/* Auto-redirect authenticated users */}
            <HomePageRedirect />

            {/* Clean Modern Background */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Subtle Dot Pattern */}
                <div className="absolute inset-0 opacity-30">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(14, 165, 233, 0.12) 1px, transparent 0)`,
                            backgroundSize: "32px 32px"
                        }}
                    ></div>
                </div>

                {/* Harmonious Geometric Shapes */}
                <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-sky-100/50 to-teal-100/50 rounded-full blur-2xl animate-float"></div>
                <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-teal-100/40 to-emerald-100/40 rounded-full blur-3xl animate-float-delay-1"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-amber-100/30 to-sky-100/30 rounded-full blur-xl animate-float-delay-2"></div>

                {/* Harmonious Lines */}
                <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-sky-200/60 to-transparent"></div>
                <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-200/60 to-transparent"></div>

                {/* Refined Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-teal-50/40"></div>
            </div>

            {/* Header with Auth Buttons */}
            <header className="w-full px-4 py-6 sm:px-6 lg:px-8 bg-white/90 backdrop-blur-md border-b border-slate-200/50 animate-fade-in-up relative">
                {/* Header background decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-sky-50/50 via-white/80 to-teal-50/50 -z-10"></div>

                <div className="flex items-center justify-between relative">
                    {/* Brand Name */}
                    <div className="flex items-center space-x-1">
                        <div className="flex items-center justify-center w-12 h-12">
                            <Image
                                src="/images/logos/logo_linkku.png"
                                alt="Logo Linkku"
                                width={32}
                                height={32}
                                className="w-8 h-8 object-contain hover:scale-110 transition-transform duration-300"
                            />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 hover:text-sky-600 transition-colors duration-300 cursor-pointer">
                            {getAppName()}
                        </h1>
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/login"
                            className="text-sky-600 hover:text-sky-700 font-medium text-sm sm:text-base px-6 py-2.5 rounded-full hover:bg-sky-50/80 border border-sky-600/80 hover:border-sky-700 transition-all duration-200 hover:scale-105 transform backdrop-blur-sm"
                        >
                            Masuk
                        </Link>
                        <Link
                            href="/register"
                            className="bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-semibold text-sm sm:text-base px-6 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 hover:-translate-y-0.5"
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
                        <div className="absolute top-10 left-10 w-20 h-20 bg-sky-200 rounded-full opacity-20 animate-float"></div>
                        <div className="absolute top-32 right-16 w-16 h-16 bg-teal-200 rounded-full opacity-20 animate-float-delay-1"></div>
                        <div className="absolute bottom-20 left-20 w-24 h-24 bg-emerald-200 rounded-full opacity-20 animate-float-delay-2"></div>
                        <div className="absolute bottom-32 right-10 w-12 h-12 bg-amber-200 rounded-full opacity-20 animate-float-delay-3"></div>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 animate-fade-in-up">
                        Satu Tautan untuk{" "}
                        <span className="relative inline-block group">
                            {/* Main animated text */}
                            <span className="relative z-10 animate-text-shimmer-slow bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent bg-[length:300%_100%]">
                                Semua Koneksi
                            </span>

                            {/* Animated underline */}
                            <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 animate-gradient-x-slow transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></span>
                        </span>
                    </h1>
                    <p className="text-xl sm:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
                        Kelola semua link penting Anda dengan mudah dan cepat.
                    </p>

                    {/* Animated CTA Button */}
                    <div className="animate-fade-in-up animation-delay-400">
                        <Link
                            href="/register"
                            className="inline-block bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-2 hover:scale-105 animate-pulse-slow"
                        >
                            🚀 Mulai Sekarang - Gratis!
                        </Link>
                    </div>
                </div>
                {/* Features Section */}
                <section className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-lg p-8 sm:p-12 mb-16 animate-fade-in-up animation-delay-600 hover:shadow-xl transition-shadow duration-500 border border-white/50">
                    {/* Section background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-50/40 via-white/60 to-teal-50/40 rounded-3xl -z-10"></div>

                    <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-800 mb-12 animate-fade-in-up animation-delay-800">
                        Mengapa Memilih {getAppName()}?
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center group hover:transform hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-1000 p-6 rounded-2xl hover:bg-white/70 backdrop-blur-sm">
                            <div className="bg-gradient-to-br from-sky-100 to-sky-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-sky-200 group-hover:to-sky-300 transition-all duration-300 animate-bounce-slow shadow-sm">
                                <svg
                                    className="w-8 h-8 text-sky-600 group-hover:scale-110 transition-transform duration-300"
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
                            <h3 className="text-xl font-semibold text-slate-800 mb-2 group-hover:text-sky-600 transition-colors duration-300">
                                Mudah Digunakan
                            </h3>
                            <p className="text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                                Interface yang sederhana dan intuitif, cocok
                                untuk semua kalangan UMKM tanpa perlu keahlian
                                teknis.
                            </p>
                        </div>

                        <div className="text-center group hover:transform hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-1200 p-6 rounded-2xl hover:bg-white/70 backdrop-blur-sm">
                            <div className="bg-gradient-to-br from-teal-100 to-teal-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-teal-200 group-hover:to-teal-300 transition-all duration-300 animate-bounce-slow animation-delay-200 shadow-sm">
                                <svg
                                    className="w-8 h-8 text-teal-600 group-hover:scale-110 transition-transform duration-300"
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
                            <h3 className="text-xl font-semibold text-slate-800 mb-2 group-hover:text-teal-600 transition-colors duration-300">
                                Semua Tautan dalam Satu Tempat
                            </h3>
                            <p className="text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                                Tampilkan semua tautan penting: Shopee,
                                Instagram, WhatsApp, Google Maps, dan lainnya
                                dalam satu halaman.
                            </p>
                        </div>

                        <div className="text-center group hover:transform hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-1400 p-6 rounded-2xl hover:bg-white/70 backdrop-blur-sm">
                            <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-emerald-200 group-hover:to-emerald-300 transition-all duration-300 animate-bounce-slow animation-delay-400 shadow-sm">
                                <svg
                                    className="w-8 h-8 text-emerald-600 group-hover:scale-110 transition-transform duration-300"
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
                            <h3 className="text-xl font-semibold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                                Gratis & Terpercaya
                            </h3>
                            <p className="text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                                Layanan gratis yang dikelola oleh Kelurahan
                                Bongkaran untuk mendukung kemajuan UMKM lokal.
                            </p>
                        </div>
                    </div>
                </section>
                {/* Featured Articles Section */}
                // Erase false to enable featured articles
                {false && featuredArticles.length > 0 && (
                    <section className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-lg p-8 sm:p-12 mb-16 animate-fade-in-up animation-delay-1600 hover:shadow-xl transition-shadow duration-500 border border-white/50">
                        {/* Section background decoration */}
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-50/30 via-white/60 to-teal-50/30 rounded-3xl -z-10"></div>

                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 animate-fade-in-left animation-delay-1800">
                                Artikel Terbaru
                            </h2>
                            <Link
                                href="/articles"
                                className="text-sky-600 hover:text-sky-700 font-semibold text-lg hover:underline transition-all duration-200 animate-fade-in-right animation-delay-1800 hover:transform hover:scale-105 backdrop-blur-sm px-4 py-2 rounded-full border border-sky-200/50 hover:border-sky-300"
                            >
                                Lihat Semua →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredArticles.map(
                                (article: Article, index: number) => (
                                    <div
                                        key={article.id}
                                        className={`animate-fade-in-up transition-all duration-300 rounded-2xl border border-slate-200 bg-white shadow-md hover:shadow-lg p-0`}
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
                <section className="text-center bg-gradient-to-r from-sky-600 to-teal-600 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden animate-fade-in-up animation-delay-2400 hover:shadow-2xl transition-shadow duration-500">
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
                            Bergabunglah untuk merasakan manfaatnya
                        </p>
                        <div className="animate-fade-in-up animation-delay-3000">
                            <Link
                                href="/register"
                                className="bg-white hover:bg-slate-50 text-sky-600 hover:text-sky-700 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-2 hover:scale-105 inline-block"
                            >
                                ✨ Mulai Sekarang - Gratis!
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-16 mt-16 animate-fade-in-up animation-delay-3200 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-sky-400/20 to-teal-400/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-emerald-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                        {/* About Section */}
                        <div className="space-y-8 animate-fade-in-up animation-delay-3400">
                            <div>
                                <div className="flex items-center space-x-1 mb-6">
                                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-sky-100 to-teal-100">
                                        <Image
                                            src="/images/logos/logo_linkku.png"
                                            alt="Logo Linkku"
                                            width={28}
                                            height={28}
                                            className="w-7 h-7 object-contain"
                                        />
                                    </span>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-teal-400 bg-clip-text text-transparent">
                                        {getAppName()}
                                    </h3>
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed hover:text-slate-300 transition-colors duration-300">
                                    Platform digital untuk mengelola semua
                                    tautan penting Anda dengan mudah dan
                                    profesional.
                                </p>
                            </div>
                        </div>
                        {/* Contact Info */}
                        <div className="space-y-8 animate-fade-in-up animation-delay-3500">
                            <div>
                                <h4 className="text-lg font-semibold mb-5 text-slate-200">
                                    Hubungi Kami
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3 text-sm group">
                                        <Icon
                                            icon="mdi:map-marker"
                                            className="w-5 h-5 text-sky-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <span className="text-slate-400 hover:text-slate-300 transition-colors duration-300">
                                            Jl. Coklat No. 5, Surabaya
                                            <br />
                                            Jawa Timur, Indonesia
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm group">
                                        <Icon
                                            icon="mdi:email"
                                            className="w-5 h-5 text-sky-400 flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <a
                                            href="mailto:kel_bongkaran@gmail.com"
                                            className="text-slate-400 hover:text-sky-300 transition-colors duration-300 footer-link footer-focus"
                                        >
                                            kel_bongkaran@gmail.com
                                        </a>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm group">
                                        <Icon
                                            icon="mdi:phone"
                                            className="w-5 h-5 text-sky-400 flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <a
                                            href="tel:+6231357243"
                                            className="text-slate-400 hover:text-sky-300 transition-colors duration-300 footer-link footer-focus"
                                        >
                                            (031) 3572437
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Social Media Section */}
                        <div className="space-y-8 animate-fade-in-up animation-delay-3600">
                            <div>
                                <h4 className="text-lg font-semibold mb-5 text-slate-200">
                                    Ikuti Kami
                                </h4>
                                <div className="space-y-4">
                                    <a
                                        href="https://pemerintahan.surabaya.go.id/kelurahan_bongkaran/pariwisata#"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-3 text-sm group footer-focus"
                                    >
                                        <Icon
                                            icon="mdi:facebook"
                                            className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <span className="text-slate-400 group-hover:text-white text-sm font-medium transition-colors duration-300">
                                            Facebook
                                        </span>
                                    </a>
                                    <a
                                        href="https://instagram.com/@kelurahanbongkaran"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-3 text-sm group footer-focus"
                                    >
                                        <Icon
                                            icon="mdi:instagram"
                                            className="w-5 h-5 text-pink-500 group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <span className="text-slate-400 group-hover:text-white text-sm font-medium transition-colors duration-300">
                                            Instagram
                                        </span>
                                    </a>
                                    <a
                                        href="https://tiktok.com/@kelurahanbongkaran"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-3 text-sm group footer-focus"
                                    >
                                        <Icon
                                            icon="ic:baseline-tiktok"
                                            className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <span className="text-slate-400 group-hover:text-white text-sm font-medium transition-colors duration-300">
                                            TikTok
                                        </span>
                                    </a>
                                    <a
                                        href="https://pemerintahan.surabaya.go.id/kelurahan_bongkaran/pariwisata#"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-3 text-sm group footer-focus"
                                    >
                                        <Icon
                                            icon="mdi:twitter"
                                            className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <span className="text-slate-400 group-hover:text-white text-sm font-medium transition-colors duration-300">
                                            Twitter
                                        </span>
                                    </a>
                                </div>
                            </div>
                        </div>{" "}
                        {/* Partners Section */}
                        <div className="space-y-8 animate-fade-in-up animation-delay-3800">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4 group">
                                    <Image
                                        src="/images/logos/logo_surabaya.png"
                                        alt="Logo Kota Surabaya"
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <span className="text-slate-400 group-hover:text-white text-sm font-medium flex-1 transition-colors duration-300">
                                        Pemerintah Kota Surabaya
                                    </span>
                                </div>
                                <div className="flex items-center space-x-4 group">
                                    <Image
                                        src="/images/logos/logo_upnjatim.png"
                                        alt="Logo UPN Jawa Timur"
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <span className="text-slate-400 group-hover:text-white text-sm font-medium flex-1 transition-colors duration-300">
                                        UPN Jawa Timur
                                    </span>
                                </div>
                                <div className="flex items-center space-x-4 group">
                                    <Image
                                        src="/images/logos/logo_kkn15bongkaran.png"
                                        alt="Logo KKN 15 Bongkaran"
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <span className="text-slate-400 group-hover:text-white text-sm font-medium flex-1 transition-colors duration-300">
                                        Tim KKN 15 Bongkaran
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Footer */}
                    <div className="border-t border-slate-800 mt-16 pt-10 animate-fade-in-up animation-delay-4000">
                        <div className="text-center">
                            <p className="text-sm text-slate-400 hover:text-slate-300 transition-colors duration-300">
                                © 2025 {getAppName()}. Dibuat dengan
                                <span className="text-red-400 mx-1">❤️</span>
                                oleh KKN UPN di Surabaya.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
