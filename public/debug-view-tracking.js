// Debug utility for testing view tracking
// Run this in browser console to clear session storage for testing

function clearArticleViewTracking() {
    const keys = Object.keys(sessionStorage);
    const articleViewKeys = keys.filter((key) =>
        key.startsWith("article_view_")
    );

    articleViewKeys.forEach((key) => {
        sessionStorage.removeItem(key);
        console.log(`Removed: ${key}`);
    });

    console.log(
        `Cleared ${articleViewKeys.length} article view tracking entries`
    );
}

function showArticleViewTracking() {
    const keys = Object.keys(sessionStorage);
    const articleViewKeys = keys.filter((key) =>
        key.startsWith("article_view_")
    );

    if (articleViewKeys.length === 0) {
        console.log("No article view tracking entries found");
        return;
    }

    console.log("Article view tracking entries:");
    articleViewKeys.forEach((key) => {
        const timestamp = sessionStorage.getItem(key);
        const articleId = key.replace("article_view_", "");
        const date = new Date(parseInt(timestamp));
        console.log(`Article ${articleId}: ${date.toLocaleString()}`);
    });
}

// Export to global scope for testing
if (typeof window !== "undefined") {
    window.clearArticleViewTracking = clearArticleViewTracking;
    window.showArticleViewTracking = showArticleViewTracking;
}

console.log("Debug utilities loaded:");
console.log("- clearArticleViewTracking() - Clear all article view tracking");
console.log("- showArticleViewTracking() - Show current tracking entries");
