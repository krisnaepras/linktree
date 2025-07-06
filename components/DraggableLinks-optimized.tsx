"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type DetailLinktree = {
    id: string;
    title: string;
    url: string;
    sortOrder: number;
    isVisible: boolean;
    category: {
        id: string;
        name: string;
        icon: string | null;
    };
};

interface DraggableLinksProps {
    links: DetailLinktree[];
    onReorder: (reorderedLinks: DetailLinktree[]) => void;
}

export default function DraggableLinks({
    links,
    onReorder
}: DraggableLinksProps) {
    const [draggedItem, setDraggedItem] = useState<DetailLinktree | null>(null);
    const [draggedOver, setDraggedOver] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, item: DetailLinktree) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, item: DetailLinktree) => {
        e.preventDefault();
        setDraggedOver(item.id);
    };

    const handleDragLeave = () => {
        setDraggedOver(null);
    };

    const handleDrop = (e: React.DragEvent, targetItem: DetailLinktree) => {
        e.preventDefault();

        if (!draggedItem || draggedItem.id === targetItem.id) {
            setDraggedItem(null);
            setDraggedOver(null);
            return;
        }

        const reorderedLinks = [...links];
        const draggedIndex = reorderedLinks.findIndex(
            (link) => link.id === draggedItem.id
        );
        const targetIndex = reorderedLinks.findIndex(
            (link) => link.id === targetItem.id
        );

        // Remove dragged item
        reorderedLinks.splice(draggedIndex, 1);

        // Insert at new position
        reorderedLinks.splice(targetIndex, 0, draggedItem);

        // Update sort orders
        const updatedLinks = reorderedLinks.map((link, index) => ({
            ...link,
            sortOrder: index + 1
        }));

        onReorder(updatedLinks);
        setDraggedItem(null);
        setDraggedOver(null);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDraggedOver(null);
    };

    return (
        <div className="space-y-3">
            {links
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((link) => (
                    <div
                        key={link.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, link)}
                        onDragOver={(e) => handleDragOver(e, link)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, link)}
                        onDragEnd={handleDragEnd}
                        className={`p-4 border border-slate-200 rounded-lg cursor-move transition-colors bg-white ${
                            draggedItem?.id === link.id
                                ? "opacity-50"
                                : draggedOver === link.id
                                ? "border-sky-400 bg-sky-50"
                                : "hover:border-slate-300 hover:bg-slate-50"
                        }`}
                    >
                        {/* Mobile Layout */}
                        <div className="block sm:hidden">
                            <div className="flex items-start space-x-3 mb-3">
                                <div className="flex items-center justify-center w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-grab active:cursor-grabbing mt-1">
                                    <svg
                                        className="w-4 h-4 text-slate-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 8h16M4 16h16"
                                        />
                                    </svg>
                                </div>
                                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                    {link.category.icon ? (
                                        link.category.icon.startsWith(
                                            "/uploads/"
                                        ) ? (
                                            <Image
                                                src={link.category.icon}
                                                alt={link.category.name}
                                                width={40}
                                                height={40}
                                                className="w-10 h-10 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <span className="text-3xl">
                                                {link.category.icon}
                                            </span>
                                        )
                                    ) : (
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                            <span className="text-slate-400 text-xl">
                                                📄
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-slate-800 truncate">
                                        {link.title}
                                    </h4>
                                    <p className="text-sm text-slate-600">
                                        {link.category.name}
                                    </p>
                                    <p className="text-sm text-sky-600 truncate">
                                        {link.url}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-slate-500">
                                        #{link.sortOrder}
                                    </span>
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            link.isVisible
                                                ? "bg-emerald-100 text-emerald-800"
                                                : "bg-slate-100 text-slate-800"
                                        }`}
                                    >
                                        {link.isVisible
                                            ? "Tampil"
                                            : "Tersembunyi"}
                                    </span>
                                </div>
                                <Link
                                    href={`/dashboard/links/edit/${link.id}`}
                                    className="inline-flex items-center justify-center w-full px-3 py-2 text-sky-600 hover:text-sky-700 hover:bg-sky-50 text-sm font-medium rounded-md border border-sky-200 hover:border-sky-300 transition-colors"
                                >
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                    </svg>
                                    Edit Link
                                </Link>
                            </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:flex sm:items-center sm:justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-grab active:cursor-grabbing">
                                    <svg
                                        className="w-4 h-4 text-slate-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 8h16M4 16h16"
                                        />
                                    </svg>
                                </div>
                                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                    {link.category.icon ? (
                                        link.category.icon.startsWith(
                                            "/uploads/"
                                        ) ? (
                                            <Image
                                                src={link.category.icon}
                                                alt={link.category.name}
                                                width={40}
                                                height={40}
                                                className="w-10 h-10 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <span className="text-3xl">
                                                {link.category.icon}
                                            </span>
                                        )
                                    ) : (
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                            <span className="text-slate-400 text-xl">
                                                📄
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-800">
                                        {link.title}
                                    </h4>
                                    <p className="text-sm text-slate-600">
                                        {link.category.name}
                                    </p>
                                    <p className="text-sm text-sky-600 truncate max-w-xs">
                                        {link.url}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-slate-500">
                                    #{link.sortOrder}
                                </span>
                                <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        link.isVisible
                                            ? "bg-emerald-100 text-emerald-800"
                                            : "bg-slate-100 text-slate-800"
                                    }`}
                                >
                                    {link.isVisible ? "Tampil" : "Tersembunyi"}
                                </span>
                                <Link
                                    href={`/dashboard/links/edit/${link.id}`}
                                    className="inline-flex items-center px-3 py-2 text-sky-600 hover:text-sky-700 hover:bg-sky-50 text-sm font-medium rounded-md border border-sky-200 hover:border-sky-300 transition-colors"
                                >
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                    </svg>
                                    Edit Link
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
        </div>
    );
}
