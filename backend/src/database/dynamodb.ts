import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand
} from '@aws-sdk/lib-dynamodb';

import { config } from '../../config';
import { TestRun } from './testRun';

// Create a DynamoDB client using the environment-based AWS configuration.
const client = new DynamoDBClient({
  region: config.aws.region,

  // Redirect DynamoDB requests to our local Floci instance.
  endpoint: config.aws.endpoint,

  // Use local dummy credentials instead of real AWS credentials.
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
  }
});

// Create a document client for easier JavaScript object operations.
const dynamodb = DynamoDBDocumentClient.from(client);

// Use the configured DynamoDB table for storing test-run metadata.
const TABLE_NAME = config.dynamodbTableName;

// Store a strongly typed test-run record in DynamoDB.
export async function saveTestRun(
  run: TestRun
): Promise<void> {

  // Insert or replace the test-run metadata using runId as the primary key.
  await dynamodb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: run
    })
  );

  // Log the stored run ID for debugging and CI visibility.
  console.log(`Saved test run: ${run.runId}`);
}

// Retrieve a specific test-run record using its runId.
export async function getTestRun(
  runId: string
): Promise<TestRun | undefined> {

  // Query DynamoDB for the requested test run.
  const response = await dynamodb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        runId
      }
    })
  );

  // Convert the DynamoDB item back into our TestRun model.
  return response.Item as TestRun | undefined;
}