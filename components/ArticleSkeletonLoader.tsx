export default function ArticleSkeletonLoader() {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            {/* Image Skeleton */}
            <div className="w-full h-48 bg-gray-200"></div>

            {/* Content Skeleton */}
            <div className="p-6">
                {/* Category and Meta */}
                <div className="flex items-center gap-4 mb-3">
                    <div className="h-5 w-16 bg-gray-200 rounded"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>

                {/* Title */}
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>

                {/* Excerpt */}
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>

                {/* Author and Date */}
                <div className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
            </div>
        </div>
    );
}
