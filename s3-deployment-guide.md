# Deploying Your Terraform File Viewer to Amazon S3

This guide will walk you through deploying your React application to an Amazon S3 bucket for static website hosting.

## Prerequisites

1. An AWS account
2. AWS CLI installed and configured on your machine
3. Your React application ready for production

## Step 1: Build Your React Application

First, create a production build of your React application:

```bash
npm run build
```

This will create a `dist` folder (since we're using Vite) containing optimized static files ready for deployment.

## Step 2: Create an S3 Bucket

1. Sign in to the AWS Management Console
2. Navigate to the S3 service
3. Click "Create bucket"
4. Enter a unique bucket name (e.g., `terraform-file-viewer`)
5. Choose your preferred AWS Region
6. Uncheck "Block all public access" (since this is a public website)
7. Acknowledge the warning about making the bucket public
8. Keep other settings as default
9. Click "Create bucket"

## Step 3: Configure the Bucket for Static Website Hosting

1. Click on your newly created bucket
2. Go to the "Properties" tab
3. Scroll down to "Static website hosting"
4. Click "Edit"
5. Select "Enable" for Static website hosting
6. Enter `index.html` for both "Index document" and "Error document"
7. Click "Save changes"

## Step 4: Set Bucket Permissions

### Update Bucket Policy

1. Go to the "Permissions" tab
2. Under "Bucket policy", click "Edit"
3. Paste the following policy (replace `your-bucket-name` with your actual bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

4. Click "Save changes"

## Step 5: Upload Your Application Files

You can upload your files using the AWS CLI:

```bash
aws s3 sync dist/ s3://your-bucket-name --acl public-read
```

Or using the AWS Management Console:

1. Go to the "Objects" tab
2. Click "Upload"
3. Drag and drop all files from your `dist` folder or click "Add files" to select them
4. Click "Upload"

## Step 6: Access Your Website

1. Go back to the "Properties" tab
2. Scroll down to "Static website hosting"
3. You'll find your website URL under "Bucket website endpoint"
4. Click the URL to visit your deployed application

## Additional Configuration for Single-Page Applications

Since this is a React single-page application, you might encounter issues when refreshing the page or accessing routes directly. To fix this, you can set up CloudFront with specific routing rules or use the S3 website endpoint with the following approach:

1. Make sure your error document is set to `index.html`
2. In your React app, use `HashRouter` instead of `BrowserRouter` if you're using React Router

## Automating Deployments

To automate deployments, you can create a deployment script:

```bash
#!/bin/bash
# Build the React app
npm run build

# Sync with S3 bucket
aws s3 sync dist/ s3://your-bucket-name --acl public-read

# Optionally invalidate CloudFront cache if you're using CloudFront
# aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"

echo "Deployment complete! Your app is live at http://your-bucket-name.s3-website-your-region.amazonaws.com"
```

Save this as `deploy.sh`, make it executable with `chmod +x deploy.sh`, and run it whenever you want to deploy.
