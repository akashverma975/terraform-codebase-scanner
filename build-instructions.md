# Building and Deploying Your Terraform File Viewer

## Understanding the Build Process

When working with a React application built with Vite, there are two main commands for building and deploying:

### 1. `npm run build`

This command creates a production-ready build of your application. When you run:

```bash
npm run build
```

Vite compiles your React code, optimizes assets, and generates static files in the `dist` directory. This includes:
- Minified JavaScript bundles
- Optimized CSS
- Processed assets like images
- An `index.html` file that ties everything together

The `dist` directory contains everything needed to serve your application on any static hosting service.

### 2. `npm run deploy`

This is the custom command we've added to automate the deployment process. When you run:

```bash
npm run deploy
```

It does two things:
1. Runs `npm run build` to create the production build
2. Executes the `deploy-s3.js` script to upload the build files to your S3 bucket

## Deployment Workflow

Here's the complete workflow for deploying your application:

1. **Develop locally** using `npm run dev`
2. **Make changes** to your code
3. **Test locally** to ensure everything works
4. **Deploy to S3** using `npm run deploy`

## Manual Deployment Option

If you prefer to separate the build and deploy steps, you can:

1. Run `npm run build` to generate the `dist` directory
2. Manually upload the contents of the `dist` directory to your S3 bucket using:
   - The AWS Management Console
   - The AWS CLI: `aws s3 sync dist/ s3://your-bucket-name --acl public-read`
   - Or run `node deploy-s3.js` separately after building

## Troubleshooting

If you encounter issues during the build or deployment:

1. **Build errors**: Check the console output for specific error messages
2. **Deployment errors**: Ensure your AWS credentials are correct in the `.env` file
3. **S3 access issues**: Verify your bucket permissions and policy
4. **Missing dependencies**: Run `npm install` to ensure all dependencies are installed

Remember that the `npm run deploy` command is a convenience that combines both the build and upload steps. You can always run these steps separately if needed.
