import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

type Props = {
    params: { slug: string };
};

async function getLinktree(slug: string) {
    const linktree = await prisma.linktree.findUnique({
        where: {
            slug,
            isActive: true
        },
        include: {
            user: {
                select: {
                    name: true
                }
            },
            detailLinktrees: {
                where: {
                    isVisible: true
                },
                include: {
                    category: true
                },
                orderBy: {
                    sortOrder: "asc"
                }
            }
        }
    });

    return linktree;
}

export default async function LinktreePage({ params }: Props) {
    const linktree = await getLinktree(params.slug);

    if (!linktree) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            <div className="max-w-md mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    {linktree.photo && (
                        <div className="mb-4">
                            <Image
                                src={linktree.photo}
                                alt={linktree.title}
                                width={120}
                                height={120}
                                className="rounded-full mx-auto object-cover border-4 border-white shadow-lg"
                            />
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {linktree.title}
                    </h1>
                    <p className="text-gray-600">
                        UMKM Kelurahan Bongkaran, Surabaya
                    </p>
                </div>

                {/* Links */}
                <div className="space-y-4 mb-8">
                    {linktree.detailLinktrees.map((link) => (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
                        >
                            <div className="flex items-center">
                                <div className="w-14 h-14 flex items-center justify-center mr-4 flex-shrink-0">
                                    {link.category.icon ? (
                                        link.category.icon.startsWith(
                                            "/uploads/"
                                        ) ? (
                                            <Image
                                                src={link.category.icon}
                                                alt={link.category.name}
                                                width={56}
                                                height={56}
                                                className="w-14 h-14 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 flex items-center justify-center">
                                                <span className="text-4xl leading-none">
                                                    {link.category.icon}
                                                </span>
                                            </div>
                                        )
                                    ) : (
                                        <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <span className="text-gray-400 text-2xl">
                                                📄
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {link.title}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {link.category.name}
                                    </p>
                                </div>
                                <svg
                                    className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                </svg>
                            </div>
                        </a>
                    ))}
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-500 space-y-2">
                    <div className="flex justify-center space-x-4 mb-4">
                        <div className="flex items-center space-x-2">
                            <Image
                                src="/images/logos/logo_surabaya.png"
                                alt="Logo Surabaya"
                                width={24}
                                height={24}
                                className="object-contain"
                            />
                            <Image
                                src="/images/logos/logo_upnjatim.png"
                                alt="Logo UPN"
                                width={24}
                                height={24}
                                className="object-contain"
                            />
                            <Image
                                src="/images/logos/logo_kkn15bongkaran.png"
                                alt="Logo KKN"
                                width={24}
                                height={24}
                                className="object-contain"
                            />
                        </div>
                    </div>
                    <p>Dibuat dengan ❤️ oleh KKN UPN di Kelurahan Bongkaran</p>
                    <div className="pt-4">
                        <Link
                            href="/"
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                        >
                            <svg
                                className="w-4 h-4 mr-1"
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
                            Buat LinkUMKM Anda
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
