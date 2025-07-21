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
    alternates: {
        canonical: "https://linkku.web.id"
    },
    openGraph: {
        title: "Linkku - Satu Tautan Semua Koneksi",
        description: "Platform tautan profesional gratis untuk UMKM Indonesia",
        url: "https://linkku.web.id",
        siteName: "Linkku",
        images: [
            {
                url: "https://linkku.web.id/images/logos/logo_linkku_bgcircle.png",
                width: 800,
                height: 600,
                alt: "Logo Linkku"
            }
        ],
        locale: "id_ID",
        type: "website"
    },
    twitter: {
        card: "summary_large_image",
        title: "Linkku - Satu Tautan Semua Koneksi",
        description: "Solusi praktis kelola semua tautan UMKM Anda",
        images: ["https://linkku.web.id/images/logos/logo_linkku_bgcircle.png"]
    },
    icons: {
        icon: '/favicon.ico',  // Untuk regular favicon
        shortcut: '/favicon.ico', // Untuk shortcut icon
        apple: '/favicon.ico', // Untuk iOS devices (disarankan 180x180px)
    },
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Definisi objek JSON-LD
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Linkku",
        url: "https://linkku.web.id",
        logo: "https://linkku.web.id/images/logos/logo_linkku_bgcircle.png",
        // sameAs: [
        //     "https://facebook.com/linkkuid",
        //     "https://instagram.com/linkkuid",
        //     "https://tiktok.com/@linkkuid"
        // ]
    };

    return (
        <html lang="id">
            <head>
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link
                    rel="shortcut icon"
                    href="/favicon.ico"
                    sizes="any"
                    // type="image/png"
                />
                {/* Menggunakan dangerouslySetInnerHTML untuk JSON-LD */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(organizationSchema)
                    }}
                />
            </head>
            <body className={`${poppins.variable} antialiased`}>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
