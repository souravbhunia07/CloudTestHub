import {
  GetQueueUrlCommand,
  SendMessageCommand,
  SQSClient
} from '@aws-sdk/client-sqs';

import { config } from '../../config';

// Create an SQS client configured to communicate with Floci locally.
const sqs = new SQSClient({
  region: config.aws.region,

  // Redirect SQS requests to the local Floci AWS emulator.
  endpoint: config.aws.endpoint,

  // Use local dummy credentials instead of real AWS credentials.
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
  }
});

// Retrieve the URL of the configured CloudTestHub SQS queue.
export async function getQueueUrl(): Promise<string> {
  // Ask SQS to resolve the configured queue name into its URL.
  const response = await sqs.send(
    new GetQueueUrlCommand({
      QueueName: config.sqsQueueName
    })
  );

  // Fail clearly if SQS did not return a queue URL.
  if (!response.QueueUrl) {
    throw new Error(
      `SQS queue URL not found: ${config.sqsQueueName}`
    );
  }

  // Return the queue URL for later message operations.
  return response.QueueUrl;
}

// Publish a test-run job containing the execution correlation information.
export async function sendTestRunMessage(
  runId: string,
  projectId: string
): Promise<void> {
  // Resolve the configured queue name into its actual SQS URL.
  const queueUrl = await getQueueUrl();

  // Create the message consumed later by the CloudTestHub worker.
  const message = {
    runId,
    projectId
  };

  // Send the test-run job to the SQS queue.
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: queueUrl,

      // Serialize the job object because SQS messages are strings.
      MessageBody: JSON.stringify(message)
    })
  );

  // Log the queued execution for debugging and CI visibility.
  console.log(
    `Queued test run ${runId} for project ${projectId}`
  );
}