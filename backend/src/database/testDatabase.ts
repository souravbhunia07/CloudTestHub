import { createTestRun } from './createTestRun';
import { getTestRun } from './dynamodb';

// Verify that CloudTestHub can create and retrieve a test-run record.
async function main(): Promise<void> {

  // Create a new test run for our first example project.
  const run = await createTestRun('demo-project');

  console.log('Created test run:');
  console.log(run);

  // Retrieve the same run from DynamoDB to verify persistence.
  const storedRun = await getTestRun(run.runId);

  console.log('Retrieved test run:');
  console.log(storedRun);
}

// Execute the DynamoDB verification script.
main().catch((error) => {
  console.error('Database test failed:', error);
  process.exit(1);
});