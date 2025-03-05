import { S3 } from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET = process.env.S3_BUCKET;
const BUILD_DIR = path.join(__dirname, 'dist');

if (!BUCKET) {
  console.error('Error: S3_BUCKET environment variable is required');
  process.exit(1);
}

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('Error: AWS credentials are required. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.');
  process.exit(1);
}

// Function to upload a file to S3
async function uploadFile(filePath) {
  const relativeFilePath = path.relative(BUILD_DIR, filePath);
  const fileContent = fs.readFileSync(filePath);
  const contentType = mime.lookup(filePath) || 'application/octet-stream';
  
  const params = {
    Bucket: BUCKET,
    Key: relativeFilePath.replace(/\\/g, '/'), // Convert Windows backslashes to forward slashes
    Body: fileContent,
    ContentType: contentType,
    ACL: 'public-read'
  };
  
  try {
    await s3.upload(params).promise();
    console.log(`✅ Uploaded: ${relativeFilePath}`);
  } catch (error) {
    console.error(`❌ Error uploading ${relativeFilePath}:`, error);
  }
}

// Function to recursively get all files in a directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });
  
  return arrayOfFiles;
}

// Main deployment function
async function deploy() {
  console.log(`🚀 Starting deployment to S3 bucket: ${BUCKET}`);
  
  try {
    // Get all files from the build directory
    const files = getAllFiles(BUILD_DIR);
    
    // Upload each file to S3
    for (const file of files) {
      await uploadFile(file);
    }
    
    console.log(`\n🎉 Deployment complete! Your app is live at: http://${BUCKET}.s3-website-${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`);
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Run the deployment
deploy();
