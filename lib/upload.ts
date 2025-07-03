import { NextRequest } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export interface UploadResult {
    success: boolean;
    fileName?: string;
    filePath?: string;
    error?: string;
}

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export async function uploadCategoryIcon(
    request: NextRequest
): Promise<UploadResult> {
    try {
        const formData = await request.formData();
        const file = formData.get("icon") as File;

        if (!file) {
            return { success: false, error: "No file uploaded" };
        }

        const validation = validateImageFile(file, 2);
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        // Generate unique filename
        const fileExtension = file.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExtension}`;

        // Define upload path
        const uploadDir = join(
            process.cwd(),
            "public",
            "uploads",
            "category-icons"
        );

        // Save the uploaded file
        const filePath = await saveUploadedFile(file, uploadDir, fileName);

        // Return relative path for storing in database
        const relativePath = `/uploads/category-icons/${fileName}`;

        return {
            success: true,
            fileName,
            filePath: relativePath
        };
    } catch (error) {
        console.error("Upload error:", error);
        return {
            success: false,
            error: "Failed to upload file"
        };
    }
}

export function validateImageFile(
    file: File,
    maxSizeMB: number = 2
): ValidationResult {
    // Validate file type
    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
        };
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
        return {
            isValid: false,
            error: `File too large. Maximum size is ${maxSizeMB}MB.`
        };
    }

    return { isValid: true };
}

export async function saveUploadedFile(
    file: File,
    uploadDir: string,
    fileName: string
): Promise<string> {
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create directory if it doesn't exist
    const fs = require("fs").promises;
    await fs.mkdir(uploadDir, { recursive: true });

    // Define full file path
    const filePath = join(uploadDir, fileName);

    // Write file to disk
    await writeFile(filePath, buffer);

    return filePath;
}

export async function deleteCategoryIcon(iconPath: string): Promise<boolean> {
    try {
        if (!iconPath || !iconPath.startsWith("/uploads/category-icons/")) {
            return false;
        }

        const fs = require("fs").promises;
        const fullPath = join(process.cwd(), "public", iconPath);

        try {
            await fs.unlink(fullPath);
            return true;
        } catch (error) {
            // File might not exist, which is ok
            console.log("File not found for deletion:", fullPath);
            return true;
        }
    } catch (error) {
        console.error("Delete error:", error);
        return false;
    }
}
