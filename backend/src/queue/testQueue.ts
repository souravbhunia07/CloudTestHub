import { getQueueUrl } from './sqs';

// Verify that CloudTestHub can connect to its configured SQS queue.
async function main(): Promise<void> {
  // Resolve the CloudTestHub queue name into its SQS URL.
  const queueUrl = await getQueueUrl();

  // Print the queue URL so we can verify the connection.
  console.log('CloudTestHub SQS queue:');
  console.log(queueUrl);
}

// Execute the SQS connectivity test.
main().catch((error) => {
  // Report any SQS connection or configuration failure.
  console.error('SQS test failed:', error);

  // Return a non-zero exit code so CI detects the failure.
  process.exit(1);
});