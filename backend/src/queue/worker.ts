import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient
} from '@aws-sdk/client-sqs';

import { config } from '../../config';
import { executeTestRun } from '../runner/runTests';
import { getQueueUrl } from './sqs';

// Create an SQS client configured to communicate with Floci locally.
const sqs = new SQSClient({
  region: config.aws.region,

  // Redirect SQS requests to the local Floci emulator.
  endpoint: config.aws.endpoint,

  // Use local development credentials.
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
  }
});

// Continuously poll SQS and execute queued CloudTestHub test runs.
async function startWorker(): Promise<void> {
  // Resolve the configured queue name into its SQS URL.
  const queueUrl = await getQueueUrl();

  // Keep the worker alive so it can process multiple test runs.
  while (true) {
    // Wait for up to one message from the CloudTestHub queue.
    const response = await sqs.send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 10,
        VisibilityTimeout: 180
      })
    );

    // Continue polling when the queue is currently empty.
    if (!response.Messages || response.Messages.length === 0) {
      continue;
    }

    // Process every message returned by this polling request.
    for (const message of response.Messages) {
      // Ignore malformed messages that do not contain a body.
      if (!message.Body || !message.ReceiptHandle) {
        continue;
      }

      try {
        // Convert the SQS message body back into a JavaScript object.
        const job = JSON.parse(message.Body) as {
          runId: string;
          projectId: string;
        };

        // Print the job being processed for debugging and CI visibility.
        console.log(
          `Processing run ${job.runId} for project ${job.projectId}`
        );

        // Execute the Playwright test associated with this SQS job.
        await executeTestRun(
          job.runId,
          job.projectId
        );

        // Delete the message only after successful test processing.
        await sqs.send(
          new DeleteMessageCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: message.ReceiptHandle
          })
        );

        // Confirm that the completed job was removed from the queue.
        console.log(
          `Completed and deleted SQS message for run ${job.runId}`
        );
      } catch (error) {
        // Leave failed messages in SQS so they can become visible again for retry.
        console.error('Worker failed to process message:', error);
      }
    }
  }
}

// Start the long-running CloudTestHub SQS worker process.
startWorker().catch((error) => {
  // Report fatal worker startup or polling failures.
  console.error('Worker stopped:', error);

  // Return a non-zero exit code so CI detects worker failure.
  process.exit(1);
});