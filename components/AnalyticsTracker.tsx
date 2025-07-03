"use client";

import { useEffect } from "react";

interface AnalyticsTrackerProps {
    slug: string;
    linkId?: string;
    action: "view" | "click";
}

export default function AnalyticsTracker({
    slug,
    linkId,
    action
}: AnalyticsTrackerProps) {
    useEffect(() => {
        const trackEvent = async () => {
            try {
                if (action === "view") {
                    await fetch("/api/track/view", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            slug,
                            userAgent: navigator.userAgent,
                            referrer: document.referrer
                        })
                    });
                } else if (action === "click" && linkId) {
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
                }
            } catch (error) {
                console.error("Error tracking event:", error);
            }
        };

        trackEvent();
    }, [slug, linkId, action]);

    return null; // This component doesn't render anything
}
