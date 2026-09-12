import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';

import { config } from '../../config';
import { TestRun } from './testRun';

// Create a DynamoDB client using the environment-based AWS configuration.
const client = new DynamoDBClient({
  region: config.aws.region,

  // Redirect DynamoDB requests to our local Floci instance.
  endpoint: config.aws.endpoint,

  // Use floci credentials instead of real AWS credentials.
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
export async function saveTestRun(run: TestRun): Promise<void> {
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

// Update selected fields of an existing test-run record.
export async function updateTestRun(
  runId: string,
  updates: Partial<Omit<TestRun, 'runId'>>
): Promise<void> {
  // Convert the supplied fields into a DynamoDB update expression.
  const entries = Object.entries(updates);

  // Stop execution when there is nothing to update.
  if (entries.length === 0) {
    return;
  }

  // Create DynamoDB expression names and values for every updated field.
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, unknown> = {};

  // Build the SET expression dynamically from the supplied fields.
  const updateExpression = entries
    .map(([key], index) => {
      const name = `#field${index}`;
      const value = `:value${index}`;

      expressionAttributeNames[name] = key;
      expressionAttributeValues[value] = updates[key as keyof typeof updates];

      return `${name} = ${value}`;
    })
    .join(', ');

  // Update the existing test-run record in DynamoDB.
  await dynamodb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        runId
      },
      UpdateExpression: `SET ${updateExpression}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    })
  );

  // Log the updated run ID for CI and debugging visibility.
  console.log(`Updated test run: ${runId}`);
}