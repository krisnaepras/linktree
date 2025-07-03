"use client";

import { useEffect, useState } from "react";

interface SlugInputProps {
    placeholder?: string;
    className?: string;
    register?: any;
}

export default function SlugInput({
    placeholder,
    className,
    register
}: SlugInputProps) {
    const [currentHost, setCurrentHost] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setCurrentHost(window.location.host);
        }
    }, []);

    return (
        <div className="flex">
            <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg">
                {currentHost || "yoursite.com"}/
            </span>
            <input
                type="text"
                placeholder={placeholder}
                className={`flex-1 px-3 py-2 border border-gray-400 rounded-r-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white ${
                    className || ""
                }`}
                {...(register || {})}
            />
        </div>
    );
}
