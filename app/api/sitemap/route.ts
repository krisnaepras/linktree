import { NextResponse } from "next/server";

export async function GET() {
    const baseUrl = "https://linkku.web.id";

    const pages = [
        { loc: "/", lastmod: "2025-07-21", changefreq: "daily", priority: 1.0 }
        // Tambahkan halaman publik lain jika ada
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
    .map(
        (page) => `<url>
  <loc>${baseUrl}${page.loc}</loc>
  <lastmod>${page.lastmod}</lastmod>
  <changefreq>${page.changefreq}</changefreq>
  <priority>${page.priority}</priority>
</url>`
    )
    .join("\n")}
</urlset>`;

    return new NextResponse(xml, {
        headers: {
            "Content-Type": "application/xml"
        }
    });
}
