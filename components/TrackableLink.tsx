"use client";

import { ReactNode } from "react";

interface TrackableLinkProps {
    href: string;
    linkId: string;
    className?: string;
    children: ReactNode;
}

export default function TrackableLink({
    href,
    linkId,
    className,
    children
}: TrackableLinkProps) {
    const handleClick = async (e: React.MouseEvent) => {
        // Track the click
        try {
            await fetch("/api/track/click", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    linkId,
                    userAgent: navigator.userAgent,
                    referrer: document.referrer
                })
            });
        } catch (error) {
            console.error("Error tracking click:", error);
        }

        // Don't prevent default - let the link navigate normally
    };

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
            onClick={handleClick}
        >
            {children}
        </a>
    );
}
