import Link from "next/link";

export default function SuperAdminArticles() {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Kelola Artikel
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Kelola semua artikel di platform sebagai Super
                                Admin
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/superadmin"
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                ← Kembali ke Dashboard
                            </Link>
                            <Link
                                href="/admin/articles"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                Panel Admin Artikel
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Navigation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Kelola Artikel */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center mb-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <svg
                                    className="w-6 h-6 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 ml-3">
                                Kelola Artikel
                            </h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Kelola semua artikel yang ada di platform, termasuk
                            yang dibuat oleh admin lain
                        </p>
                        <Link
                            href="/admin/articles"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Lihat Semua Artikel →
                        </Link>
                    </div>

                    {/* Kelola Kategori Artikel */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center mb-4">
                            <div className="bg-green-100 p-3 rounded-lg">
                                <svg
                                    className="w-6 h-6 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 ml-3">
                                Kategori Artikel
                            </h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Kelola kategori artikel untuk mengorganisir konten
                            dengan baik
                        </p>
                        <Link
                            href="/admin/article-categories"
                            className="text-green-600 hover:text-green-800 font-medium"
                        >
                            Kelola Kategori →
                        </Link>
                    </div>

                    {/* Statistik Artikel */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center mb-4">
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <svg
                                    className="w-6 h-6 text-purple-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 ml-3">
                                Statistik Artikel
                            </h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Lihat statistik dan performa artikel di platform
                        </p>
                        <Link
                            href="/admin/articles"
                            className="text-purple-600 hover:text-purple-800 font-medium"
                        >
                            Lihat Statistik →
                        </Link>
                    </div>

                    {/* Artikel Publik */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center mb-4">
                            <div className="bg-orange-100 p-3 rounded-lg">
                                <svg
                                    className="w-6 h-6 text-orange-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 ml-3">
                                Lihat Artikel Publik
                            </h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Lihat bagaimana artikel ditampilkan di halaman
                            publik
                        </p>
                        <Link
                            href="/articles"
                            className="text-orange-600 hover:text-orange-800 font-medium"
                        >
                            Lihat Halaman Publik →
                        </Link>
                    </div>

                    {/* Buat Artikel Baru */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center mb-4">
                            <div className="bg-indigo-100 p-3 rounded-lg">
                                <svg
                                    className="w-6 h-6 text-indigo-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 ml-3">
                                Buat Artikel Baru
                            </h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Buat artikel baru dengan editor yang mudah digunakan
                        </p>
                        <Link
                            href="/admin/articles/create"
                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            Buat Artikel →
                        </Link>
                    </div>

                    {/* Kembali ke Homepage */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center mb-4">
                            <div className="bg-gray-100 p-3 rounded-lg">
                                <svg
                                    className="w-6 h-6 text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 ml-3">
                                Kembali ke Homepage
                            </h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Kembali ke halaman utama platform
                        </p>
                        <Link
                            href="/"
                            className="text-gray-600 hover:text-gray-800 font-medium"
                        >
                            Ke Homepage →
                        </Link>
                    </div>
                </div>

                {/* Info Section */}
                <div className="mt-8 bg-blue-50 rounded-lg p-6">
                    <div className="flex items-start">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <svg
                                className="w-5 h-5 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-lg font-semibold text-blue-900 mb-2">
                                Tentang Kelola Artikel
                            </h4>
                            <p className="text-blue-700">
                                Sebagai Super Admin, Anda memiliki akses penuh
                                untuk mengelola semua artikel yang ada di
                                platform. Anda dapat membuat, mengedit,
                                menghapus, dan mengatur status publikasi artikel
                                dari semua pengguna.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
