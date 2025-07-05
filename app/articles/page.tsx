import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import ArticleFilters from "@/components/ArticleFilters";
import ScrollToTop from "@/components/ScrollToTop";

type ArticleCategory = {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
};

type Article = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
    publishedAt: Date | null;
    readingTime: number | null;
    viewCount: number;
    author: {
        name: string;
    };
    category: ArticleCategory | null;
};

type Props = {
    searchParams: Promise<{
        category?: string;
        search?: string;
        page?: string;
    }>;
};

async function getArticles(
    categorySlug?: string,
    search?: string,
    page: number = 1
) {
    const limit = 12;
    const skip = (page - 1) * limit;

    const where: any = {
        status: "PUBLISHED"
    };

    if (categorySlug) {
        where.category = {
            slug: categorySlug
        };
    }

    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { excerpt: { contains: search, mode: "insensitive" } }
        ];
    }

    const [articles, total] = await Promise.all([
        prisma.article.findMany({
            where,
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
                        slug: true,
                        icon: true,
                        color: true
                    }
                }
            },
            orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
            skip,
            take: limit
        }),
        prisma.article.count({ where })
    ]);

    return {
        articles,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
}

async function getCategories() {
    return await prisma.articleCategory.findMany({
        orderBy: { name: "asc" }
    });
}

async function getFeaturedArticles() {
    return await prisma.article.findMany({
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
                    id: true,
                    name: true,
                    slug: true,
                    icon: true,
                    color: true
                }
            }
        },
        orderBy: { publishedAt: "desc" },
        take: 3
    });
}

export default async function ArticlesPage({ searchParams }: Props) {
    const resolvedSearchParams = await searchParams;
    const page = parseInt(resolvedSearchParams.page || "1");
    const categorySlug = resolvedSearchParams.category;
    const search = resolvedSearchParams.search;

    const [{ articles, pagination }, categories, featuredArticles] =
        await Promise.all([
            getArticles(categorySlug, search, page),
            getCategories(),
            getFeaturedArticles()
        ]);

    const formatDate = (date: Date | null) => {
        if (!date) return "";
        return date.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    const getReadingTime = (readingTime: number | null) => {
        if (!readingTime) return "3 min read";
        return `${readingTime} min read`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
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
                            <span className="text-gray-900 font-medium">
                                Artikel
                            </span>
                        </nav>

                        {/* Back to Homepage Button */}
                        <Link
                            href="/"
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
                            Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filter */}
                <ArticleFilters
                    categories={categories}
                    currentCategory={categorySlug}
                    currentSearch={search}
                />

                {/* Category Pills - Hidden on Mobile */}
                <div className="hidden sm:flex flex-wrap gap-2 mb-8">
                    <Link
                        href="/articles"
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            !categorySlug
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        Semua
                    </Link>
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/articles?category=${category.slug}`}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                                categorySlug === category.slug
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            {category.icon && (
                                <span className="text-lg">
                                    {category.icon.startsWith("/") ? (
                                        <img
                                            src={category.icon}
                                            alt={category.name}
                                            className="w-4 h-4"
                                        />
                                    ) : (
                                        category.icon
                                    )}
                                </span>
                            )}
                            {category.name}
                        </Link>
                    ))}
                </div>

                {/* Featured Articles */}
                {!categorySlug && !search && featuredArticles.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Artikel Unggulan
                        </h2>
                        <div className="relative">
                            <div className="flex overflow-x-auto pb-4 space-x-6 scrollbar-hide">
                                {featuredArticles.map((article) => (
                                    <Link
                                        key={article.id}
                                        href={`/articles/${article.slug}`}
                                        className="group flex-shrink-0 w-80"
                                    >
                                        <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full">
                                            {article.featuredImage && (
                                                <div className="aspect-w-16 aspect-h-9">
                                                    <Image
                                                        src={
                                                            article.featuredImage
                                                        }
                                                        alt={article.title}
                                                        width={400}
                                                        height={225}
                                                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>
                                            )}
                                            <div className="p-6">
                                                <div className="flex items-center gap-4 mb-3">
                                                    {article.category && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {article.category
                                                                .icon && (
                                                                <span className="mr-1">
                                                                    {article.category.icon.startsWith(
                                                                        "/"
                                                                    ) ? (
                                                                        <img
                                                                            src={
                                                                                article
                                                                                    .category
                                                                                    .icon
                                                                            }
                                                                            alt=""
                                                                            className="w-3 h-3"
                                                                        />
                                                                    ) : (
                                                                        article
                                                                            .category
                                                                            .icon
                                                                    )}
                                                                </span>
                                                            )}
                                                            {
                                                                article.category
                                                                    .name
                                                            }
                                                        </span>
                                                    )}
                                                    <span className="text-sm text-gray-500">
                                                        {getReadingTime(
                                                            article.readingTime
                                                        )}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                    {article.title}
                                                </h3>
                                                {article.excerpt && (
                                                    <p className="text-gray-600 mb-4 line-clamp-3">
                                                        {article.excerpt}
                                                    </p>
                                                )}
                                                <div className="flex items-center justify-between text-sm text-gray-500">
                                                    <span>
                                                        Oleh{" "}
                                                        {article.author.name}
                                                    </span>
                                                    <div className="flex items-center space-x-3">
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
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                            {article.viewCount}
                                                        </div>
                                                        <span>
                                                            {formatDate(
                                                                article.publishedAt
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Articles Grid */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {categorySlug
                                ? `Artikel ${
                                      categories.find(
                                          (c) => c.slug === categorySlug
                                      )?.name
                                  }`
                                : search
                                ? `Hasil Pencarian: "${search}"`
                                : "Semua Artikel"}
                        </h2>
                    </div>

                    {articles.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg
                                    className="mx-auto h-12 w-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Tidak ada artikel
                            </h3>
                            <p className="text-gray-500">
                                Belum ada artikel yang ditemukan dengan kriteria
                                pencarian Anda.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {articles.map((article) => (
                                <Link
                                    key={article.id}
                                    href={`/articles/${article.slug}`}
                                    className="group"
                                >
                                    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                                        {article.featuredImage && (
                                            <div className="aspect-w-16 aspect-h-9">
                                                <Image
                                                    src={article.featuredImage}
                                                    alt={article.title}
                                                    width={400}
                                                    height={225}
                                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-center gap-4 mb-3">
                                                {article.category && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {article.category
                                                            .icon && (
                                                            <span className="mr-1">
                                                                {article.category.icon.startsWith(
                                                                    "/"
                                                                ) ? (
                                                                    <img
                                                                        src={
                                                                            article
                                                                                .category
                                                                                .icon
                                                                        }
                                                                        alt=""
                                                                        className="w-3 h-3"
                                                                    />
                                                                ) : (
                                                                    article
                                                                        .category
                                                                        .icon
                                                                )}
                                                            </span>
                                                        )}
                                                        {article.category.name}
                                                    </span>
                                                )}
                                                <span className="text-sm text-gray-500">
                                                    {getReadingTime(
                                                        article.readingTime
                                                    )}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 flex-shrink-0">
                                                {article.title}
                                            </h3>
                                            {article.excerpt && (
                                                <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                                                    {article.excerpt}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                                                <span>
                                                    Oleh {article.author.name}
                                                </span>
                                                <div className="flex items-center space-x-3">
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
                                                        {article.viewCount}
                                                    </div>
                                                    <span>
                                                        {formatDate(
                                                            article.publishedAt
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="mt-12 flex justify-center">
                        <nav className="flex space-x-2">
                            {pagination.page > 1 && (
                                <Link
                                    href={`/articles?page=${
                                        pagination.page - 1
                                    }${
                                        categorySlug
                                            ? `&category=${categorySlug}`
                                            : ""
                                    }${search ? `&search=${search}` : ""}`}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Sebelumnya
                                </Link>
                            )}

                            {Array.from(
                                { length: pagination.pages },
                                (_, i) => i + 1
                            ).map((pageNum) => (
                                <Link
                                    key={pageNum}
                                    href={`/articles?page=${pageNum}${
                                        categorySlug
                                            ? `&category=${categorySlug}`
                                            : ""
                                    }${search ? `&search=${search}` : ""}`}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                                        pageNum === pagination.page
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    {pageNum}
                                </Link>
                            ))}

                            {pagination.page < pagination.pages && (
                                <Link
                                    href={`/articles?page=${
                                        pagination.page + 1
                                    }${
                                        categorySlug
                                            ? `&category=${categorySlug}`
                                            : ""
                                    }${search ? `&search=${search}` : ""}`}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Selanjutnya
                                </Link>
                            )}
                        </nav>
                    </div>
                )}
            </main>
        </div>
    );
}
