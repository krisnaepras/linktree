"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight =
                document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            setProgress(progress);
        };

        window.addEventListener("scroll", updateProgress);
        return () => window.removeEventListener("scroll", updateProgress);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
            <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
