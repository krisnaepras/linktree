"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { FiUpload, FiLink, FiX, FiImage } from "react-icons/fi";

interface UploadImageProps {
    value?: string;
    onChange: (url: string) => void;
    onError?: (error: string) => void;
    className?: string;
    placeholder?: string;
    label?: string;
}

export default function UploadImage({
    value,
    onChange,
    onError,
    className = "",
    placeholder = "Masukkan URL gambar atau upload file",
    label = "Gambar"
}: UploadImageProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMode, setUploadMode] = useState<"url" | "upload">("url");
    const [urlInput, setUrlInput] = useState(value || "");
    const [imageError, setImageError] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp"
        ];
        if (!allowedTypes.includes(file.type)) {
            onError?.(
                "Tipe file tidak valid. Hanya JPEG, PNG, GIF, dan WebP yang diizinkan."
            );
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            onError?.("Ukuran file terlalu besar. Maksimal 5MB.");
            return;
        }

        setIsUploading(true);
        setImageError(false);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/admin/upload", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Upload failed");
            }

            const data = await response.json();
            onChange(data.url);
            setUrlInput(data.url);
        } catch (error) {
            console.error("Upload error:", error);
            onError?.(
                error instanceof Error
                    ? error.message
                    : "Gagal mengupload gambar"
            );
        } finally {
            setIsUploading(false);
        }
    };

    const handleUrlChange = (url: string) => {
        setUrlInput(url);
        onChange(url);
        setImageError(false);
    };

    const handleImageError = () => {
        setImageError(true);
        onError?.(
            "Gambar tidak dapat dimuat. Periksa URL atau coba upload ulang."
        );
    };

    const clearImage = () => {
        setUrlInput("");
        onChange("");
        setImageError(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={() => setUploadMode("url")}
                        className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                            uploadMode === "url"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        <FiLink className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setUploadMode("upload")}
                        className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                            uploadMode === "upload"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        <FiUpload className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {uploadMode === "url" && (
                <div className="space-y-2">
                    <div className="relative">
                        <input
                            type="url"
                            value={urlInput}
                            onChange={(e) => handleUrlChange(e.target.value)}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            placeholder={placeholder}
                        />
                        {urlInput && (
                            <button
                                type="button"
                                onClick={clearImage}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <FiX className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {uploadMode === "upload" && (
                <div className="space-y-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-600 hover:border-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <div className="flex items-center justify-center space-x-2">
                            {isUploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    <span>Mengupload...</span>
                                </>
                            ) : (
                                <>
                                    <FiUpload className="w-4 h-4" />
                                    <span>Klik untuk upload gambar</span>
                                </>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            JPEG, PNG, GIF, WebP (Max 5MB)
                        </p>
                    </button>
                </div>
            )}

            {/* Image Preview */}
            {urlInput && !imageError && (
                <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                        src={urlInput}
                        alt="Preview"
                        fill
                        className="object-cover"
                        onError={handleImageError}
                    />
                    <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                        <FiX className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Image Error */}
            {imageError && urlInput && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-700 rounded-lg">
                    <FiImage className="w-4 h-4" />
                    <span className="text-sm">Gambar tidak dapat dimuat</span>
                    <button
                        type="button"
                        onClick={clearImage}
                        className="ml-auto text-red-500 hover:text-red-700"
                    >
                        <FiX className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
