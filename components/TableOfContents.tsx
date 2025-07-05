"use client";

import { useEffect, useState } from "react";

interface TocItem {
    id: string;
    text: string;
    level: number;
}

export default function TableOfContents({ content }: { content: string }) {
    const [tocItems, setTocItems] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Parse headings from content
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/html");
        const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");

        const items: TocItem[] = [];
        headings.forEach((heading, index) => {
            const id = `heading-${index}`;
            const text = heading.textContent || "";
            const level = parseInt(heading.tagName.charAt(1));

            items.push({ id, text, level });
        });

        setTocItems(items);
    }, [content]);

    useEffect(() => {
        // Add IDs to actual headings in the DOM
        const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
        headings.forEach((heading, index) => {
            heading.id = `heading-${index}`;
        });

        // Intersection observer for active heading
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "-80px 0px -80% 0px" }
        );

        headings.forEach((heading) => observer.observe(heading));

        return () => observer.disconnect();
    }, []);

    if (tocItems.length === 0) return null;

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 z-40 border"
                title="Daftar Isi"
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                </svg>
            </button>

            {/* Table of Contents */}
            {isVisible && (
                <div className="fixed right-4 top-20 w-64 bg-white rounded-lg shadow-xl border z-30 max-h-96 overflow-y-auto">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">
                                Daftar Isi
                            </h3>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg
                                    className="w-4 h-4"
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
                        </div>
                        <nav className="space-y-1">
                            {tocItems.map((item) => (
                                <a
                                    key={item.id}
                                    href={`#${item.id}`}
                                    className={`block py-1 px-2 text-sm rounded hover:bg-gray-100 transition-colors ${
                                        activeId === item.id
                                            ? "bg-blue-100 text-blue-700 font-medium"
                                            : "text-gray-600"
                                    }`}
                                    style={{
                                        paddingLeft: `${
                                            (item.level - 1) * 12 + 8
                                        }px`
                                    }}
                                    onClick={() => setIsVisible(false)}
                                >
                                    {item.text}
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            {/* Overlay */}
            {isVisible && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-20 z-20"
                    onClick={() => setIsVisible(false)}
                />
            )}
        </>
    );
}
