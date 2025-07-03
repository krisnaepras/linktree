import Image from "next/image";
import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            {/* Header with Logos */}
            <header className="w-full px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center space-x-8 sm:space-x-12">
                    <div className="flex items-center space-x-2">
                        <Image
                            src="/images/logos/logo_surabaya.png"
                            alt="Logo Kota Surabaya"
                            width={50}
                            height={50}
                            className="w-10 h-10 sm:w-12 sm:h-12"
                        />
                        <span className="text-xs sm:text-sm font-medium text-gray-700 hidden sm:block">
                            Kota Surabaya
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Image
                            src="/images/logos/logo_upnjatim.png"
                            alt="Logo UPN Jawa Timur"
                            width={50}
                            height={50}
                            className="w-10 h-10 sm:w-12 sm:h-12"
                        />
                        <span className="text-xs sm:text-sm font-medium text-gray-700 hidden sm:block">
                            UPN Jawa Timur
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Image
                            src="/images/logos/logo_kkn15bongkaran.png"
                            alt="Logo KKN 15 Bongkaran"
                            width={50}
                            height={50}
                            className="w-10 h-10 sm:w-12 sm:h-12"
                        />
                        <span className="text-xs sm:text-sm font-medium text-gray-700 hidden sm:block">
                            KKN 15 Bongkaran
                        </span>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                        Satu Tautan untuk{" "}
                        <span className="text-blue-600">UMKM Bongkaran</span>
                    </h1>
                    <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Bantu UMKM di Surabaya tampil online dengan mudah dan
                        cepat.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/register"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
                        >
                            Daftar Sekarang
                        </Link>
                        <Link
                            href="/login"
                            className="bg-white hover:bg-gray-50 text-blue-600 font-semibold py-4 px-8 rounded-full text-lg border-2 border-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
                        >
                            Masuk
                        </Link>
                    </div>
                </div>

                {/* Features Section */}
                <section className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
                        Mengapa Memilih LinkUMKM Bongkaran?
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Mudah Digunakan
                            </h3>
                            <p className="text-gray-600">
                                Interface yang sederhana dan intuitif, cocok
                                untuk semua kalangan UMKM tanpa perlu keahlian
                                teknis.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Semua Tautan dalam Satu Tempat
                            </h3>
                            <p className="text-gray-600">
                                Tampilkan semua tautan penting: Shopee,
                                Instagram, WhatsApp, Google Maps, dan lainnya
                                dalam satu halaman.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-orange-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Gratis & Terpercaya
                            </h3>
                            <p className="text-gray-600">
                                Layanan gratis yang dikelola oleh Kelurahan
                                Bongkaran untuk mendukung kemajuan UMKM lokal.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="text-center bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl p-8 sm:p-12 text-white">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        Siap Memulai Perjalanan Digital Anda?
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Bergabunglah dengan ratusan UMKM Bongkaran yang telah
                        merasakan manfaatnya
                    </p>
                    <Link
                        href="/register"
                        className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-4 px-8 rounded-full text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block"
                    >
                        Mulai Sekarang - Gratis!
                    </Link>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-gray-600">
                        <p className="text-sm sm:text-base">
                            © 2025 LinkUMKM Bongkaran. Dibuat dengan ❤️ oleh KKN
                            UPN di Surabaya.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
