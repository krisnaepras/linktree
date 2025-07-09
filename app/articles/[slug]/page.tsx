import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import ShareButtons from "@/components/ShareButtons";
import ViewTracker from "@/components/ViewTracker";
import ReadingProgress from "@/components/ReadingProgress";
import TableOfContents from "@/components/TableOfContents";
import ScrollToTop from "@/components/ScrollToTop";

type Props = {
    params: Promise<{ slug: string }>;
};

async function getArticle(slug: string) {
    const article = await prisma.article.findUnique({
        where: {
            slug,
            status: "PUBLISHED"
        },
        include: {
            author: {
                select: {
                    name: true
                }
            },
            category: {
                select: {
                    id: true,
                    name: true,
                    icon: true
                }
            }
        }
    });

    return article;
}

async function getRelatedArticles(
    categoryId: string | null,
    currentArticleId: string,
    tags: string[] = []
) {
    // First try to get articles from same category
    let relatedArticles: any[] = [];

    if (categoryId) {
        relatedArticles = await prisma.article.findMany({
            where: {
                categoryId,
                status: "PUBLISHED",
                id: { not: currentArticleId }
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
                        color: true
                    }
                }
            },
            orderBy: {
                publishedAt: "desc"
            },
            take: 3
        });
    }

    // If we don't have enough articles, get popular articles
    if (relatedArticles.length < 3) {
        const additionalArticles = await prisma.article.findMany({
            where: {
                status: "PUBLISHED",
                id: { not: currentArticleId },
                ...(categoryId && { categoryId: { not: categoryId } })
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
                        color: true
                    }
                }
            },
            orderBy: {
                viewCount: "desc"
            },
            take: 3 - relatedArticles.length
        });

        relatedArticles = [...relatedArticles, ...additionalArticles];
    }

    return relatedArticles;
}

export default async function ArticlePage({ params }: Props) {
    const { slug } = await params;
    const article = await getArticle(slug);

    if (!article) {
        notFound();
    }

    const relatedArticles = await getRelatedArticles(
        article.category?.id || null,
        article.id
    );

    const formatDate = (date: Date | string) => {
        const dateObj = typeof date === "string" ? new Date(date) : date;
        return dateObj.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <ReadingProgress />
            <TableOfContents content={article.content} />
            <ScrollToTop />
            {/* Header - Thin Navbar */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        {/* Breadcrumb Navigation */}
                        <nav className="flex items-center space-x-2 text-sm text-gray-600">
                            <Link
                                href="/"
                                className="hover:text-blue-600 transition-colors"
                            >
                                <svg
                                    className="w-4 h-4 inline mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    />
                                </svg>
                                Beranda
                            </Link>
                            <svg
                                className="w-4 h-4 text-gray-400"
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
                            <Link
                                href="/articles"
                                className="hover:text-blue-600 transition-colors"
                            >
                                Artikel
                            </Link>
                            <svg
                                className="w-4 h-4 text-gray-400"
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
                            <span className="text-gray-900 font-medium truncate max-w-xs">
                                {article.title}
                            </span>
                        </nav>

                        {/* Back to Articles Button */}
                        <Link
                            href="/articles"
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                            Kembali ke Artikel
                        </Link>
                    </div>
                </div>
            </header>

            {/* Article Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <article className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Featured Image */}
                    {article.featuredImage && (
                        <div className="aspect-video w-full">
                            <Image
                                src={article.featuredImage}
                                alt={article.title}
                                width={800}
                                height={450}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="p-6 sm:p-8">
                        {/* Article Meta */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                {article.category && (
                                    <div className="flex items-center">
                                        {article.category.icon && (
                                            <span className="mr-1 text-lg">
                                                {article.category.icon}
                                            </span>
                                        )}
                                        <span className="font-medium">
                                            {article.category.name}
                                        </span>
                                    </div>
                                )}
                                <span>•</span>
                                <span>Oleh {article.author.name}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                    <svg
                                        className="w-4 h-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                    </svg>
                                    {article.viewCount} views
                                </div>
                                <span>•</span>
                                <span>
                                    {article.publishedAt
                                        ? formatDate(article.publishedAt)
                                        : formatDate(article.createdAt)}
                                </span>
                                {article.readingTime && (
                                    <>
                                        <span>•</span>
                                        <div className="flex items-center">
                                            <svg
                                                className="w-4 h-4 mr-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            {article.readingTime} menit baca
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                            {article.title}
                        </h1>

                        {/* Excerpt */}
                        {article.excerpt && (
                            <div className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                                {article.excerpt}
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className="prose prose-lg max-w-none prose-gray prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800 prose-a:text-blue-600 prose-blockquote:text-gray-700"
                            dangerouslySetInnerHTML={{
                                __html: article.content
                            }}
                        />

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <div className="flex flex-wrap gap-2">
                                    {article.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Share */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Bagikan Artikel
                            </h3>
                            <ShareButtons
                                title={article.title}
                                excerpt={article.excerpt || undefined}
                            />
                        </div>
                    </div>
                </article>

                {/* View Tracker */}
                <ViewTracker articleId={article.id} slug={article.slug} />

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                    <section className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Artikel Terkait
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedArticles.map((relatedArticle) => (
                                <article
                                    key={relatedArticle.id}
                                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col"
                                >
                                    {relatedArticle.featuredImage && (
                                        <div className="aspect-video w-full">
                                            <Image
                                                src={
                                                    relatedArticle.featuredImage
                                                }
                                                alt={relatedArticle.title}
                                                width={300}
                                                height={200}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 flex-shrink-0">
                                            <Link
                                                href={`/articles/${relatedArticle.slug}`}
                                                className="hover:text-blue-600"
                                            >
                                                {relatedArticle.title}
                                            </Link>
                                        </h3>
                                        {relatedArticle.excerpt && (
                                            <p className="text-sm text-gray-600 line-clamp-3 mb-2 flex-1">
                                                {relatedArticle.excerpt}
                                            </p>
                                        )}
                                        <div className="text-xs text-gray-500 mt-auto">
                                            Oleh {relatedArticle.author.name}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {/* CTA */}
                <section className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 sm:p-8 text-white text-center">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4">
                        Punya UMKM juga?
                    </h2>
                    <p className="text-base sm:text-lg opacity-90 mb-6">
                        Buat Linktree Anda sendiri dan jangkau lebih banyak
                        pelanggan!
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-50 transition-colors"
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
                        Buat Linkku Gratis
                    </Link>
                </section>
            </main>
        </div>
    );
}
