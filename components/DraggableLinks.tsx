"use client";

import { useState } from "react";
import Link from "next/link";

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
                        className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-move transition-all duration-200 ${
                            draggedItem?.id === link.id
                                ? "opacity-50 scale-95"
                                : draggedOver === link.id
                                ? "border-blue-400 bg-blue-50"
                                : "hover:border-gray-300 hover:shadow-sm"
                        }`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2 text-gray-400">
                                <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                                <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                            </div>
                            {link.category.icon && (
                                <span className="text-xl">
                                    {link.category.icon}
                                </span>
                            )}
                            <div>
                                <h4 className="font-medium text-gray-900">
                                    {link.title}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {link.category.name}
                                </p>
                                <p className="text-sm text-blue-600 truncate max-w-xs">
                                    {link.url}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                                #{link.sortOrder}
                            </span>
                            <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    link.isVisible
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                            >
                                {link.isVisible ? "Tampil" : "Tersembunyi"}
                            </span>
                            <Link
                                href={`/dashboard/links/edit/${link.id}`}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                Edit
                            </Link>
                        </div>
                    </div>
                ))}
        </div>
    );
}
