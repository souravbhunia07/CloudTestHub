import { createTestRun } from './createTestRun';
import { getTestRun, updateTestRun } from './dynamodb';

// Verify that CloudTestHub can create, update, and retrieve a test-run record.
async function main(): Promise<void> {
  // Create a new test run in the QUEUED state.
  const run = await createTestRun('demo-project');

  console.log('Created test run:');
  console.log(run);

  // Move the test run from QUEUED to RUNNING.
  await updateTestRun(run.runId, {
    status: 'RUNNING'
  });

  // Simulate a completed Playwright execution.
  await updateTestRun(run.runId, {
    status: 'PASSED',
    passed: 1,
    failed: 0,
    skipped: 0,
    finishedAt: new Date().toISOString(),
    duration: 1250
  });

  // Retrieve the final test-run state from DynamoDB.
  const storedRun = await getTestRun(run.runId);

  console.log('Final test run:');
  console.log(storedRun);
}

// Execute the DynamoDB lifecycle verification.
main().catch((error) => {
  console.error('Database test failed:', error);
  process.exit(1);
});