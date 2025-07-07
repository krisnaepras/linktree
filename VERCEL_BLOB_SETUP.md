# Vercel Blob Storage Setup

## Why Vercel Blob?

Vercel's serverless functions have a read-only file system, which means you can't save uploaded files to the local file system in production. Vercel Blob provides a simple solution for file uploads.

## Setup Steps

### 1. Install Vercel CLI (if not already installed)
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Create a Blob Store
```bash
vercel blob create
```

This will create a new blob store and provide you with a token.

### 4. Add Environment Variable

Add the following environment variable to your Vercel project:

**In Vercel Dashboard:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add a new variable:
   - Name: `BLOB_READ_WRITE_TOKEN`
   - Value: `[your-blob-token-from-step-3]`
   - Environment: Production (and Preview if needed)

**Or via CLI:**
```bash
vercel env add BLOB_READ_WRITE_TOKEN
```

### 5. Redeploy your application
```bash
vercel --prod
```

## Alternative: Using Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to "Storage" tab
4. Click "Create Database" > "Blob"
5. Copy the generated token
6. Add it to your environment variables

## Testing

After setup, test the upload functionality:

1. **Category Icons**: Try uploading an icon when creating/editing a category
2. **Article Images**: Try uploading images in article creation
3. **Linktree Photos**: Try uploading a profile photo

## Environment Variables Summary

Make sure you have these environment variables set in production:

```env
BLOB_READ_WRITE_TOKEN=your_blob_token_here
NODE_ENV=production
```

## Troubleshooting

If you're still getting the "read-only file system" error:

1. Check that `BLOB_READ_WRITE_TOKEN` is set correctly
2. Redeploy the application after setting the environment variable
3. Check the Vercel function logs for any errors

## Local Development

For local development, the system will fallback to local file storage in the `public/uploads` directory. No additional setup is needed for local development.
