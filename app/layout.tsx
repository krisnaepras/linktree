import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth-provider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"]
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"]
});

export const metadata: Metadata = {
    title: "LinkUMKM Bongkaran - Satu Tautan untuk UMKM Surabaya",
    description:
        "Platform digital untuk UMKM di Kelurahan Bongkaran, Kecamatan Pabean Cantian, Kota Surabaya. Bantu UMKM tampil online dengan mudah dan cepat."
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
