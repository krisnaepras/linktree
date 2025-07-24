import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth-provider";

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    display: "swap"
});

export const metadata: Metadata = {
    title: "Linkku - Satu Tautan untuk Semua Koneksi UMKM",
    description:
        "Kelola semua link Shopee, Instagram, WhatsApp, Google Maps UMKM Anda dalam satu halaman profesional. Gratis!",
    keywords: [
        "linkku",
        "link ku",
        "linktree",
        "link tree",
        "bio link",
        "umkm",
        "toko online",
        "shopee link",
        "instagram link",
        "whatsapp business",
        "google maps link",
        "satu link semua platform",
        "link management",
        "bisnis online",
        "social media links",
        "landing page",
        "indonesia umkm",
        "gratis link tool",
        "professional links"
    ],
    authors: [{ name: "Linkku Team" }],
    creator: "Linkku",
    publisher: "Linkku",
    alternates: {
        canonical: "https://linkku.web.id"
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1
        }
    },
    openGraph: {
        title: "Linkku - Satu Tautan Semua Koneksi UMKM",
        description:
            "Platform tautan profesional gratis untuk UMKM Indonesia. Kelola semua link bisnis Anda dalam satu tempat!",
        url: "https://linkku.web.id",
        siteName: "Linkku",
        images: [
            {
                url: "https://linkku.web.id/images/logos/logo_linkku_bgcircle.png",
                width: 1200,
                height: 630,
                alt: "Linkku - Platform Link Management untuk UMKM"
            }
        ],
        locale: "id_ID",
        type: "website"
    },
    twitter: {
        card: "summary_large_image",
        title: "Linkku - Satu Tautan Semua Koneksi UMKM",
        description:
            "Solusi praktis kelola semua tautan UMKM Anda dalam satu platform gratis",
        images: ["https://linkku.web.id/images/logos/logo_linkku_bgcircle.png"],
        creator: "@linkkuid"
    },
    verification: {
        google: "your-google-verification-code" // Ganti dengan kode verifikasi Google Anda
        // other: {
        //   'facebook-domain-verification': 'your-facebook-verification-code'
        // }
    },
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/icon0.svg", type: "image/svg+xml" },
            { url: "/icon1.png", type: "image/png", sizes: "32x32" },
            { url: "/web-app-manifest-192x192.png", type: "image/png", sizes: "192x192" }
        ],
        shortcut: "/favicon.ico",
        apple: [
            { url: "/apple-icon.png", sizes: "180x180", type: "image/png" }
        ],
        other: [
            {
                rel: "mask-icon",
                url: "/icon0.svg",
                color: "#000000"
            }
        ]
    },
    manifest: "/manifest.json",
    category: "business"
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Enhanced JSON-LD Schema
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": ["Organization", "WebSite"],
        name: "Linkku",
        alternateName: ["Link Ku", "LinkKu"],
        description: "Platform link management gratis untuk UMKM Indonesia",
        url: "https://linkku.web.id",
        logo: {
            "@type": "ImageObject",
            url: "https://linkku.web.id/images/logos/logo_linkku_bgcircle.png",
            width: 512,
            height: 512
        },
        foundingDate: "2024",
        foundingLocation: {
            "@type": "Place",
            addressLocality: "Indonesia"
        },
        serviceArea: {
            "@type": "Country",
            name: "Indonesia"
        },
        knowsAbout: [
            "Link Management",
            "UMKM",
            "Social Media Marketing",
            "Digital Marketing",
            "Bio Links"
        ],
        offers: {
            "@type": "Service",
            name: "Link Management Platform",
            description: "Kelola semua link bisnis dalam satu platform",
            price: "0",
            priceCurrency: "IDR"
        }
        // Uncomment when social media ready
        // sameAs: [
        //   "https://facebook.com/linkkuid",
        //   "https://instagram.com/linkkuid",
        //   "https://tiktok.com/@linkkuid",
        //   "https://twitter.com/linkkuid"
        // ]
    };

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Linkku",
        url: "https://linkku.web.id",
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate:
                    "https://linkku.web.id/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
        }
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://linkku.web.id"
            }
        ]
    };

    return (
        <html lang="id" dir="ltr">
            <head>
                {/* Preconnect to external domains for performance */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />

                {/* DNS Prefetch for better performance */}
                <link rel="dns-prefetch" href="//www.google-analytics.com" />

                {/* Theme color for mobile browsers */}
                <meta name="theme-color" content="#000000" />
                <meta name="msapplication-navbutton-color" content="#000000" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="black-translucent"
                />

                {/* Mobile app settings */}
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-title" content="Linkku" />

                {/* Microsoft Tiles */}
                <meta name="msapplication-TileColor" content="#000000" />
                <meta
                    name="msapplication-TileImage"
                    content="/web-app-manifest-192x192.png"
                />

                {/* Enhanced JSON-LD Schemas */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(organizationSchema)
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(websiteSchema)
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(breadcrumbSchema)
                    }}
                />
            </head>
            <body className={`${poppins.variable} antialiased`}>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
