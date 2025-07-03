"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

type Category = {
    id: string;
    name: string;
    icon: string | null;
};

interface CategoryDropdownProps {
    categories: Category[];
    selectedCategoryId: string;
    onSelect: (categoryId: string) => void;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    loading?: boolean;
}

export default function CategoryDropdown({
    categories,
    selectedCategoryId,
    onSelect,
    placeholder = "Pilih kategori",
    error,
    disabled = false,
    loading = false
}: CategoryDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get selected category
    const selectedCategory = categories.find(
        (cat) => cat.id === selectedCategoryId
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isOpen) return;

            switch (event.key) {
                case "ArrowDown":
                    event.preventDefault();
                    setHighlightedIndex((prev) =>
                        prev < categories.length - 1 ? prev + 1 : 0
                    );
                    break;
                case "ArrowUp":
                    event.preventDefault();
                    setHighlightedIndex((prev) =>
                        prev > 0 ? prev - 1 : categories.length - 1
                    );
                    break;
                case "Enter":
                    event.preventDefault();
                    if (
                        highlightedIndex >= 0 &&
                        highlightedIndex < categories.length
                    ) {
                        handleSelect(categories[highlightedIndex].id);
                    }
                    break;
                case "Escape":
                    setIsOpen(false);
                    setHighlightedIndex(-1);
                    break;
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
        }

        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, highlightedIndex, categories]);

    // Handle category selection
    const handleSelect = (categoryId: string) => {
        onSelect(categoryId);
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    // Handle dropdown toggle
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setHighlightedIndex(-1);
        }
    };

    // Render category icon
    const renderIcon = (category: Category) => {
        if (!category.icon) return null;

        // Check if icon is an emoji (not a file path)
        if (!category.icon.startsWith("/uploads/")) {
            return (
                <span className="text-lg mr-2 flex-shrink-0">
                    {category.icon}
                </span>
            );
        }

        // Render uploaded image
        return (
            <div className="w-5 h-5 mr-2 flex-shrink-0 relative">
                <Image
                    src={category.icon}
                    alt={category.name}
                    width={20}
                    height={20}
                    className="object-cover rounded"
                    onError={(e) => {
                        // Fallback to text if image fails to load
                        e.currentTarget.style.display = "none";
                    }}
                />
            </div>
        );
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Dropdown Button */}
            <button
                type="button"
                disabled={disabled}
                onClick={toggleDropdown}
                className={`w-full px-3 py-2 border border-gray-400 rounded-lg bg-gray-50 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    error
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                        : ""
                }`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                        {selectedCategory ? (
                            <>
                                {renderIcon(selectedCategory)}
                                <span className="text-gray-900 truncate">
                                    {selectedCategory.name}
                                </span>
                            </>
                        ) : (
                            <span className="text-gray-500 truncate">
                                {placeholder}
                            </span>
                        )}
                    </div>
                    <div className="flex-shrink-0 ml-2">
                        {isOpen ? (
                            <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                        )}
                    </div>
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {loading ? (
                        <div className="px-3 py-2 text-gray-500 text-center">
                            <div className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full mr-2"></div>
                            Memuat kategori...
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="px-3 py-2 text-gray-500 text-center">
                            Tidak ada kategori
                        </div>
                    ) : (
                        categories.map((category, index) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => handleSelect(category.id)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                className={`w-full px-3 py-3 sm:py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors touch-manipulation ${
                                    selectedCategoryId === category.id
                                        ? "bg-blue-50 text-blue-700"
                                        : highlightedIndex === index
                                        ? "bg-gray-50 text-gray-900"
                                        : "text-gray-900"
                                }`}
                            >
                                <div className="flex items-center">
                                    {renderIcon(category)}
                                    <span className="truncate">
                                        {category.name}
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
