"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type ArticleCategory = {
    id: string;
    name: string;
    slug: string;
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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
        setIsDropdownOpen(false);
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

    const getCurrentCategoryName = () => {
        if (!currentCategory) return "Semua Kategori";
        const category = categories.find((c) => c.slug === currentCategory);
        return category ? category.name : "Semua Kategori";
    };

    return (
        <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Cari artikel..."
                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                        />
                        <svg
                            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
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
                                className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 hover:text-gray-600"
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

                {/* Custom Category Dropdown */}
                <div className="relative sm:w-64">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium truncate">
                                {getCurrentCategoryName()}
                            </span>
                            <svg
                                className={`w-5 h-5 text-gray-400 transition-transform ${
                                    isDropdownOpen ? "rotate-180" : ""
                                }`}
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
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsDropdownOpen(false)}
                            />
                            <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                <div className="py-2">
                                    <button
                                        onClick={() => handleCategoryChange("")}
                                        className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                                            !currentCategory
                                                ? "bg-blue-50 text-blue-700 font-medium"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        Semua Kategori
                                    </button>
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() =>
                                                handleCategoryChange(
                                                    category.slug
                                                )
                                            }
                                            className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                                                currentCategory ===
                                                category.slug
                                                    ? "bg-blue-50 text-blue-700 font-medium"
                                                    : "text-gray-700"
                                            }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
