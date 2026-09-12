import { createTestRun } from '../database/createTestRun';
import { sendTestRunMessage } from './sqs';

// Verify that CloudTestHub can create and queue a test execution.
async function main(): Promise<void> {
  // Create the test-run record that will be associated with the SQS job.
  const run = await createTestRun('demo-project');

  // Send the execution request to the CloudTestHub SQS queue.
  await sendTestRunMessage(
    run.runId,
    run.projectId
  );

  // Print the run ID so we can inspect the queued job manually.
  console.log(`Queued run ID: ${run.runId}`);
}

// Execute the SQS producer verification.
main().catch((error) => {
  // Report any DynamoDB or SQS failure.
  console.error('SQS producer test failed:', error);

  // Return a non-zero exit code so CI detects the failure.
  process.exit(1);
});