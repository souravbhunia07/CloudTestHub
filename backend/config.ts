import dotenv from 'dotenv';

// Load environment variables from the local .env file.
dotenv.config();

// Centralize CloudTestHub configuration so AWS services use the same settings.
export const config = {
  aws: {
    endpoint: process.env.AWS_ENDPOINT_URL || 'http://localhost:4566',
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  },

  // Read the S3 bucket name from environment configuration.
  s3BucketName: process.env.S3_BUCKET_NAME || 'cloudtesthub-results',

  // Read the DynamoDB table name from environment configuration.
  dynamodbTableName: process.env.DYNAMODB_TABLE_NAME || 'CloudTestRuns',

  // Read the SQS queue name from environment configuration.
  sqsQueueName: process.env.SQS_QUEUE_NAME || 'cloudtesthub-test-runs'
};