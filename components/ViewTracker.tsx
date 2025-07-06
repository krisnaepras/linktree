"use client";

import { useEffect, useRef, useState } from "react";

interface ViewTrackerProps {
    articleId: string;
    slug: string;
}

export default function ViewTracker({ articleId, slug }: ViewTrackerProps) {
    const hasTracked = useRef(false);
    const [isTracking, setIsTracking] = useState(false);
    const mounted = useRef(false);

    useEffect(() => {
        mounted.current = true;

        // Prevent double tracking in React StrictMode
        if (hasTracked.current || isTracking) return;

        // Check session storage with timestamp to prevent multiple tracking
        const sessionKey = `article_view_${articleId}`;
        const lastTracked = sessionStorage.getItem(sessionKey);

        if (lastTracked) {
            const lastTrackedTime = parseInt(lastTracked);
            const now = Date.now();
            const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

            // If tracked within the last hour, don't track again
            if (now - lastTrackedTime < oneHour) {
                hasTracked.current = true;
                console.log(
                    `Article ${articleId} already tracked within the last hour`
                );
                return;
            }
        }

        const trackView = async () => {
            // Prevent race conditions
            if (!mounted.current || hasTracked.current || isTracking) return;

            setIsTracking(true);

            try {
                console.log(`Tracking view for article ${articleId} (${slug})`);

                const response = await fetch(
                    `/api/articles/${slug}/track-view`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ articleId })
                    }
                );

                if (response.ok) {
                    const result = await response.json();

                    if (result.tracked !== false) {
                        // Mark as tracked with current timestamp
                        sessionStorage.setItem(
                            sessionKey,
                            Date.now().toString()
                        );
                        hasTracked.current = true;
                        console.log(
                            `View tracked successfully for article ${articleId}`
                        );
                    } else {
                        console.log(
                            `View already tracked recently for article ${articleId}`
                        );
                        hasTracked.current = true;
                    }
                } else {
                    console.error(
                        "Failed to track view:",
                        await response.text()
                    );
                }
            } catch (error) {
                console.error("View tracking failed:", error);
            } finally {
                setIsTracking(false);
            }
        };

        // Add a delay to prevent immediate double calls in StrictMode
        const timeoutId = setTimeout(() => {
            if (mounted.current && !hasTracked.current && !isTracking) {
                trackView();
            }
        }, 200);

        return () => {
            clearTimeout(timeoutId);
            mounted.current = false;
        };
    }, [articleId, slug, isTracking]);

    // This component doesn't render anything
    return null;
}
