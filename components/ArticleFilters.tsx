"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type ArticleCategory = {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
};

interface ArticleFiltersProps {
    categories: ArticleCategory[];
    currentCategory?: string;
    currentSearch?: string;
}

export default function ArticleFilters({
    categories,
    currentCategory,
    currentSearch
}: ArticleFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchInput, setSearchInput] = useState(currentSearch || "");

    const handleCategoryChange = (categorySlug: string) => {
        const params = new URLSearchParams(searchParams);

        if (categorySlug) {
            params.set("category", categorySlug);
        } else {
            params.delete("category");
        }

        // Reset to first page when changing category
        params.delete("page");

        router.push(`/articles?${params.toString()}`);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);

        if (searchInput.trim()) {
            params.set("search", searchInput.trim());
        } else {
            params.delete("search");
        }

        // Reset to first page when searching
        params.delete("page");

        router.push(`/articles?${params.toString()}`);
    };

    return (
        <div className="mb-8 sm:mb-8">
            <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-6">
                {/* Search */}
                <div className="flex-1">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Cari artikel..."
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <svg
                            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        {searchInput && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchInput("");
                                    const params = new URLSearchParams(
                                        searchParams
                                    );
                                    params.delete("search");
                                    params.delete("page");
                                    router.push(
                                        `/articles?${params.toString()}`
                                    );
                                }}
                                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600"
                            >
                                <svg
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        )}
                    </form>
                </div>

                {/* Category Filter */}
                <div className="sm:w-64 relative">
                    <select
                        name="category"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        value={currentCategory || ""}
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.slug}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
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
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
