import {
  S3Client,
  PutObjectCommand
} from '@aws-sdk/client-s3';

import fs from 'fs';

import { config } from '../../config';

// Create an AWS S3 client configured using our environment-based settings.
const s3 = new S3Client({
  region: config.aws.region,

  // Redirect S3 requests to Floci during local development.
  endpoint: config.aws.endpoint,

  // Use path-style URLs because they are required by our local S3 emulator.
  forcePathStyle: true,

  // Load credentials from .env instead of hardcoding them in source code.
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
  }
});

// Store CloudTestHub test artifacts in the configured S3 bucket.
const BUCKET_NAME = config.s3BucketName;

// Upload a local file to the specified location inside our S3 bucket.
export async function uploadFile(
  filePath: string,
  s3Key: string
): Promise<void> {

  // Read the local file before sending it to S3.
  const fileContent = fs.readFileSync(filePath);

  // Upload the file through the AWS-compatible S3 API.
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileContent
    })
  );

  // Print the uploaded path for debugging and CI logs.
  console.log(`Uploaded: ${s3Key}`);
}