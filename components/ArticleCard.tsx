"use client";

import Image from "next/image";
import Link from "next/link";

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

interface ArticleCardProps {
    article: Article;
    featured?: boolean;
    variant?: "default" | "homepage";
}

export default function ArticleCard({
    article,
    featured = false,
    variant = "default"
}: ArticleCardProps) {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    const cardClass = featured
        ? "group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white"
        : variant === "homepage"
        ? "group relative flex flex-col min-h-[320px] overflow-hidden w-full h-full"
        : "group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white flex flex-col";

    const imageClass = featured
        ? "w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-2xl"
        : variant === "homepage"
        ? "w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-2xl"
        : "w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-xl";

    const imageContainerClass = featured
        ? "relative overflow-hidden"
        : variant === "homepage"
        ? "relative overflow-hidden flex-shrink-0 rounded-t-2xl"
        : "relative overflow-hidden flex-shrink-0 rounded-t-xl";

    return (
        <Link href={`/articles/${article.slug}`} className="block">
            <article className={cardClass}>
                {/* Featured Badge */}
                {article.isFeatured && (
                    <div className="absolute top-4 left-4 z-10">
                        <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                            ⭐ Unggulan
                        </span>
                    </div>
                )}

                {/* Image */}
                <div className={imageContainerClass}>
                    {article.featuredImage ? (
                        <Image
                            src={article.featuredImage}
                            alt={article.title}
                            width={featured ? 600 : 400}
                            height={featured ? 300 : 250}
                            className={imageClass}
                        />
                    ) : (
                        <div
                            className={`${imageClass} bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center`}
                        >
                            <div className="text-center">
                                <svg
                                    className={`${
                                        featured ? "w-12 h-12" : "w-8 h-8"
                                    } text-gray-400 mx-auto ${
                                        featured ? "mb-2" : "mb-1"
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                                    />
                                </svg>
                                <span
                                    className={`${
                                        featured ? "text-sm" : "text-xs"
                                    } text-gray-500`}
                                >
                                    Artikel
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Overlay gradient - only for featured */}
                    {featured && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                </div>

                {/* Content */}
                <div
                    className={
                        featured
                            ? "p-6"
                            : "flex flex-col flex-1 p-4 justify-between"
                    }
                >
                    {/* Category & Meta */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            {article.category && (
                                <span className="text-xs font-medium px-2 py-1 rounded-md bg-gray-100 text-gray-700">
                                    {article.category.name}
                                </span>
                            )}
                            <span className="text-xs text-gray-500 flex items-center">
                                <svg
                                    className="w-3 h-3 mr-1"
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
                                {article._count.views}
                            </span>
                        </div>
                        {article.readingTime && (
                            <span className="text-xs text-gray-500">
                                {article.readingTime} min read
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h3
                        className={`font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 ${
                            featured ? "text-xl mb-3" : "text-lg mb-2"
                        }`}
                    >
                        {article.title}
                    </h3>

                    {/* Excerpt */}
                    {article.excerpt && (
                        <p
                            className={`text-gray-600 line-clamp-3 ${
                                featured ? "text-base mb-4" : "text-sm mb-3"
                            }`}
                        >
                            {article.excerpt}
                        </p>
                    )}

                    {/* Author & Date */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>By {article.author.name}</span>
                        <span>{formatDate(article.publishedAt)}</span>
                    </div>
                </div>
            </article>
        </Link>
    );
}
