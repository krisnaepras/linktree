# Upload System Documentation

## Overview

The upload system has been updated to support both local development and production deployment on Vercel. The system automatically detects the environment and uses the appropriate storage solution.

## Storage Solutions

### Development Environment

-   **Local File System**: Files are stored in `public/uploads/` directory
-   **Access**: Files are accessible via `/uploads/` URL path
-   **Automatic**: No additional configuration needed

### Production Environment (Vercel)

-   **Vercel Blob Storage**: Files are uploaded to Vercel's cloud storage
-   **Access**: Files are accessible via Vercel Blob URLs
-   **Configuration**: Requires `BLOB_READ_WRITE_TOKEN` environment variable

## Upload Categories

### 1. Category Icons

-   **Endpoint**: `/api/upload/category-icon`
-   **Field Name**: `icon`
-   **Max Size**: 2MB
-   **Allowed Types**: JPEG, PNG, GIF, WebP
-   **Storage Path**: `category-icons/`

### 2. Article Images

-   **Endpoint**: `/api/admin/upload`
-   **Field Name**: `file`
-   **Max Size**: 5MB
-   **Allowed Types**: JPEG, PNG, GIF, WebP
-   **Storage Path**: `articles/`

### 3. Linktree Photos

-   **Endpoint**: `/api/upload/linktree-photo`
-   **Field Name**: `photo`
-   **Max Size**: 5MB
-   **Allowed Types**: JPEG, PNG, GIF, WebP
-   **Storage Path**: `linktree-photos/`

## Environment Configuration

### Required Environment Variables

For production deployment, add the following to your Vercel environment variables:

```env
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

### How to Get Vercel Blob Token

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Create a new environment variable named `BLOB_READ_WRITE_TOKEN`
5. Get the token from Vercel Blob settings

## Error Handling

The system includes comprehensive error handling:

### File Validation Errors

-   Invalid file type
-   File size too large
-   No file provided

### Upload Errors

-   Network connection issues
-   Storage service unavailable
-   Permission denied

### User Feedback

-   Error messages are displayed using SweetAlert2
-   Success notifications confirm successful uploads
-   Progress indicators show upload status

## Implementation Details

### Upload Functions

```typescript
// Category Icons
uploadCategoryIcon(request: NextRequest): Promise<UploadResult>

// Article Images
uploadArticleImage(request: NextRequest): Promise<UploadResult>

// Linktree Photos
uploadLinktreePhoto(request: NextRequest, userId: string): Promise<UploadResult>
```

### Environment Detection

The system automatically detects the environment:

```typescript
if (
    process.env.NODE_ENV === "production" &&
    process.env.BLOB_READ_WRITE_TOKEN
) {
    // Use Vercel Blob
} else {
    // Use local file system
}
```

## Troubleshooting

### Common Issues

1. **"Gagal mengupload file icon" in production**

    - Cause: Missing `BLOB_READ_WRITE_TOKEN` environment variable
    - Solution: Add the token to Vercel environment variables

2. **"File too large" error**

    - Cause: File exceeds size limit
    - Solution: Reduce file size or increase limit in code

3. **"Invalid file type" error**

    - Cause: Unsupported file format
    - Solution: Convert to supported format (JPEG, PNG, GIF, WebP)

4. **Upload works in development but fails in production**
    - Cause: Missing or incorrect Vercel Blob configuration
    - Solution: Verify environment variables and token permissions

### Testing

To test the upload system:

1. **Development**: Start the dev server and test uploads
2. **Production**: Deploy to Vercel and test with proper environment variables

## File Structure

```
lib/
  upload.ts                     # Main upload utilities
app/api/
  upload/
    category-icon/route.ts      # Category icon upload endpoint
    linktree-photo/route.ts     # Linktree photo upload endpoint
  admin/
    upload/route.ts             # Article image upload endpoint
public/
  uploads/                      # Local development storage
    category-icons/
    articles/
    linktree-photos/
```

## Security Considerations

-   File type validation prevents malicious uploads
-   File size limits prevent abuse
-   Authentication required for admin uploads
-   User-specific naming for linktree photos
-   Unique filenames prevent conflicts

## Migration Notes

When migrating from local file storage to Vercel Blob:

1. Existing local files will remain accessible
2. New uploads will use Vercel Blob in production
3. Update any hardcoded paths to handle both URL types
4. Consider migrating existing files to Vercel Blob if needed
