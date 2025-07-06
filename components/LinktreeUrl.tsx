"use client";

import { useState } from "react";

interface LinktreeUrlProps {
    slug: string;
}

export default function LinktreeUrl({ slug }: LinktreeUrlProps) {
    const [copied, setCopied] = useState(false);

    // Get the current host URL
    const getLinktreeUrl = () => {
        if (typeof window !== "undefined") {
            return `${window.location.origin}/${slug}`;
        }
        return `/${slug}`;
    };

    const handleCopy = async () => {
        try {
            const url = getLinktreeUrl();
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy URL:", error);
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <div className="flex-1">
                <p className="text-sm text-slate-600 break-all font-medium">
                    {typeof window !== "undefined"
                        ? getLinktreeUrl()
                        : `${slug}`}
                </p>
            </div>
            <button
                onClick={handleCopy}
                className="inline-flex items-center px-3 py-1.5 border border-slate-300 shadow-sm text-sm font-medium rounded-xl text-slate-700 bg-white/80 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
                {copied ? (
                    <>
                        <svg
                            className="w-4 h-4 mr-1 text-emerald-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        Tersalin!
                    </>
                ) : (
                    <>
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
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                        </svg>
                        Salin
                    </>
                )}
            </button>
        </div>
    );
}
