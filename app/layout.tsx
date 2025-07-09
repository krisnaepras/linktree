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
            <head>
                <link rel="icon" type="image/png" href="/favicon.png" />
                <link
                    rel="shortcut icon"
                    href="/favicon.png"
                    type="image/png"
                />
            </head>
            <body className={`${poppins.variable} antialiased`}>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
