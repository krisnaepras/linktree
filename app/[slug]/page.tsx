import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import TrackableLink from "@/components/TrackableLink";

type Props = {
    params: { slug: string };
};

async function getLinktree(slug: string) {
    const linktree = await prisma.linktree.findUnique({
        where: {
            slug,
            isActive: true
        },
        include: {
            user: {
                select: {
                    name: true
                }
            },
            detailLinktrees: {
                where: {
                    isVisible: true
                },
                include: {
                    category: true
                },
                orderBy: {
                    sortOrder: "asc"
                }
            }
        }
    });

    return linktree;
}

export default async function LinktreePage({ params }: Props) {
    const { slug } = await params;
    const linktree = await getLinktree(slug);

    if (!linktree) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-200/70 via-teal-100/80 to-emerald-200/70 relative overflow-hidden">
            {/* Soft Colored Background Layers */}
            <div className="absolute inset-0 opacity-60">
                {/* Primary gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-300/40 via-teal-200/30 to-emerald-300/40"></div>

                {/* Enhanced dot pattern with soft colors */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(14, 165, 233, 0.2) 1px, transparent 0),
                                     radial-gradient(circle at 16px 16px, rgba(5, 150, 105, 0.15) 1px, transparent 0)`,
                        backgroundSize: "28px 28px, 42px 42px"
                    }}
                ></div>
            </div>

            {/* Soft Gradient Mesh */}
            <div className="absolute inset-0 opacity-20">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `linear-gradient(45deg, rgba(14, 165, 233, 0.15) 1px, transparent 1px),
                                     linear-gradient(-45deg, rgba(5, 150, 105, 0.12) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px, 80px 80px"
                    }}
                ></div>
            </div>

            {/* Clean Background Elements - No Circles */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Subtle geometric rectangles */}
                <div className="absolute top-1/4 right-1/6 w-24 h-2 bg-gradient-to-r from-sky-300/30 to-transparent rotate-12 animate-pulse-slow"></div>
                <div className="absolute bottom-1/3 left-1/8 w-20 h-2 bg-gradient-to-r from-teal-300/25 to-transparent -rotate-12 animate-pulse-slow animation-delay-1000"></div>
                <div className="absolute top-1/2 right-1/4 w-16 h-2 bg-gradient-to-r from-emerald-300/30 to-transparent rotate-45 animate-pulse-slow animation-delay-2000"></div>

                {/* Animated gradient waves with more saturation */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-sky-200/40 via-transparent to-teal-200/40 animate-pulse-slow"></div>
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-emerald-200/30 via-transparent to-sky-200/30 animate-pulse-slow animation-delay-1000"></div>
                    <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-violet-200/25 via-transparent to-rose-200/25 animate-pulse-slow animation-delay-2000"></div>
                </div>

                {/* Enhanced Animated lines with vibrant colors */}
                <div className="absolute top-1/6 left-0 w-full h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent animate-pulse"></div>
                <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-400/35 to-transparent animate-pulse animation-delay-500"></div>
                <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent animate-pulse animation-delay-1000"></div>
                <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent animate-pulse animation-delay-1500"></div>
                <div className="absolute top-5/6 left-0 w-full h-px bg-gradient-to-r from-transparent via-rose-400/30 to-transparent animate-pulse animation-delay-2000"></div>

                {/* Enhanced Corner accents - Geometric shapes instead of circles */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-sky-400/20 to-transparent transform -translate-x-16 -translate-y-16 rotate-45"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-400/20 to-transparent transform translate-x-16 -translate-y-16 rotate-45"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-400/20 to-transparent transform -translate-x-16 translate-y-16 rotate-45"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-violet-400/20 to-transparent transform translate-x-16 translate-y-16 rotate-45"></div>

                {/* Softer overlay to balance the colors */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/20 to-sky-50/30"></div>
            </div>

            {/* Track page view */}
            <AnalyticsTracker slug={slug} action="view" />

            <div className="relative z-10 max-w-md mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-in">
                    {linktree.photo && (
                        <div className="mb-6 relative">
                            <div className="relative w-32 h-32 mx-auto">
                                {/* Decorative ring - Harmonized */}
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 p-1 animate-pulse">
                                    <div className="w-full h-full bg-white rounded-full p-1">
                                        <Image
                                            src={linktree.photo}
                                            alt={linktree.title}
                                            width={120}
                                            height={120}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div>
                                </div>
                                {/* Floating badge - Harmonized */}
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                    <svg
                                        className="w-5 h-5 text-white"
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
                            </div>
                        </div>
                    )}

                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/40 mb-6 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                        {/* Enhanced animated background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-100/40 via-white/30 to-teal-100/40 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent mb-3 relative">
                                {linktree.title}
                                {/* Subtle shimmer effect on hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 opacity-0 group-hover:opacity-100"></div>
                            </h1>
                            <div className="flex items-center justify-center space-x-2 text-gray-600">
                                <svg
                                    className="w-4 h-4 text-sky-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                <span className="text-sm font-medium">
                                    UMKM Kelurahan Bongkaran, Surabaya
                                </span>
                            </div>
                            <div className="flex items-center justify-center space-x-1 mt-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-emerald-600 font-medium">
                                    Aktif
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Links - Simple version with only icon and title */}
                <div className="space-y-3 mb-8">
                    {linktree.detailLinktrees.map((link, index) => (
                        <div
                            key={link.id}
                            className="animate-slide-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <TrackableLink
                                href={link.url}
                                linkId={link.id}
                                className="block w-full p-4 bg-white/95 backdrop-blur-lg rounded-xl shadow-lg border border-white/50 hover:shadow-xl hover:bg-white/98 transition-all duration-300 group hover:scale-105 hover:border-sky-300 relative overflow-hidden"
                            >
                                {/* Enhanced hover background effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-sky-100/60 via-transparent to-teal-100/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div className="flex items-center space-x-4 relative z-10">
                                    {/* Icon */}
                                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                                        {link.category.icon ? (
                                            link.category.icon.startsWith(
                                                "http"
                                            ) ||
                                            link.category.icon.startsWith(
                                                "/uploads/"
                                            ) ? (
                                                <Image
                                                    src={link.category.icon}
                                                    alt={link.category.name}
                                                    width={48}
                                                    height={48}
                                                    className="w-12 h-12 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-teal-100 rounded-lg flex items-center justify-center shadow-sm">
                                                    <span className="text-2xl leading-none">
                                                        {link.category.icon}
                                                    </span>
                                                </div>
                                            )
                                        ) : (
                                            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-slate-200 rounded-lg flex items-center justify-center shadow-sm">
                                                <span className="text-gray-400 text-2xl">
                                                    📄
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-sky-600 transition-colors text-lg">
                                            {link.title}
                                        </h3>
                                    </div>

                                    {/* Arrow with enhanced styling */}
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="w-5 h-5 text-gray-400 group-hover:text-sky-600 transition-colors group-hover:translate-x-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </TrackableLink>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="text-center space-y-6 animate-fade-in">
                    {/* Logo section - Enhanced */}
                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/40 hover:shadow-xl transition-all duration-300">
                        <div className="flex justify-center space-x-6 mb-4">
                            <div className="flex items-center space-x-2 transform hover:scale-110 transition-transform duration-300">
                                <div className="w-8 h-8 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-shadow duration-300">
                                    <Image
                                        src="/images/logos/logo_surabaya.png"
                                        alt="Logo Surabaya"
                                        width={24}
                                        height={24}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="w-8 h-8 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-shadow duration-300">
                                    <Image
                                        src="/images/logos/logo_upnjatim.png"
                                        alt="Logo UPN"
                                        width={24}
                                        height={24}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="w-8 h-8 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-shadow duration-300">
                                    <Image
                                        src="/images/logos/logo_kkn15bongkaran.png"
                                        alt="Logo KKN"
                                        width={24}
                                        height={24}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 font-medium">
                            Dibuat dengan ❤️ oleh KKN UPN di Kelurahan Bongkaran
                        </p>
                        <div className="flex items-center justify-center space-x-2 mt-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-emerald-600 font-medium">
                                Mendukung UMKM Lokal Surabaya
                            </span>
                        </div>
                    </div>

                    {/* CTA section - Harmonized */}
                    <div className="bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
                        <h3 className="text-lg font-bold mb-2">
                            Punya UMKM juga?
                        </h3>
                        <p className="text-sm opacity-90 mb-4">
                            Buat LinkUMKM Anda sendiri dan jangkau lebih banyak
                            pelanggan!
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center px-6 py-3 bg-white text-sky-600 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
                        >
                            <svg
                                className="w-5 h-5 mr-2"
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
                            Buat LinkUMKM Gratis
                        </Link>
                    </div>
                </div>
            </div>

            {/* Enhanced Floating heart element */}
            <div className="fixed bottom-4 right-4 z-20">
                <div className="bg-white/95 backdrop-blur-lg rounded-full p-3 shadow-xl border border-white/50 animate-bounce hover:scale-110 transition-all duration-300 hover:shadow-2xl">
                    <svg
                        className="w-6 h-6 text-emerald-600"
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
            </div>
        </div>
    );
}
