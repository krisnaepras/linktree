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
    title: "Linkku - Satu Tautan Semua Koneksi",
    description:
        "Platform digital untuk bantu UMKM tampil online dengan mudah dan cepat.",
    alternates: {
        canonical: "https://linkku.web.id"
    }
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id">
            <head>
                <link rel="icon" type="image/png" href="/favicon.ico" />
                <link
                    rel="shortcut icon"
                    href="/favicon.ico"
                    type="image/png"
                />
            </head>
            <body className={`${poppins.variable} antialiased`}>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
