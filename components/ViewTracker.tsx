"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
    articleId: string;
    slug: string;
}

export default function ViewTracker({ articleId, slug }: ViewTrackerProps) {
    useEffect(() => {
        const trackView = async () => {
            try {
                await fetch(`/api/articles/${slug}/track-view`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ articleId })
                });
            } catch (error) {
                // Silently fail - view tracking should not break the page
                console.log("View tracking failed:", error);
            }
        };

        // Track view after component mounts
        trackView();
    }, [articleId, slug]);

    // This component doesn't render anything
    return null;
}
