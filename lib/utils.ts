import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Formats a URL by adding https:// if no protocol is present
 * @param url - The URL to format
 * @returns The formatted URL with protocol
 */
export function formatUrl(url: string): string {
    if (!url) return url;

    // Trim whitespace
    url = url.trim();

    // If URL already has a protocol, return as is
    if (url.match(/^https?:\/\//i)) {
        return url;
    }

    // If URL starts with //, add https:
    if (url.startsWith("//")) {
        return `https:${url}`;
    }

    // If URL starts with www. or contains a domain, add https://
    if (url.match(/^(www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/)) {
        return `https://${url}`;
    }

    // For other cases (like social media handles), assume it needs https://
    return `https://${url}`;
}

/**
 * Validates if a string is a valid URL format
 * @param url - The URL to validate
 * @returns Whether the URL is valid
 */
export function isValidUrl(url: string): boolean {
    try {
        const formattedUrl = formatUrl(url);
        new URL(formattedUrl);
        return true;
    } catch {
        return false;
    }
}

/**
 * Custom Zod transform for URL validation that auto-formats URLs
 * @param url - The URL to validate and format
 * @returns The formatted URL
 */
export function urlTransform(url: string): string {
    const formatted = formatUrl(url);

    // Validate the formatted URL
    try {
        new URL(formatted);
        return formatted;
    } catch {
        throw new Error("URL tidak valid");
    }
}
