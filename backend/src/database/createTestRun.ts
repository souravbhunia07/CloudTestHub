import { randomUUID } from 'crypto';

import { saveTestRun } from './dynamodb';
import { TestRun } from './testRun';

// Create a new test execution record with a unique runId.
export async function createTestRun(
  projectId: string
): Promise<TestRun> {

  // Generate a globally unique identifier for this test execution.
  const runId = randomUUID();

  // Create the initial test-run state before execution begins.
  const run: TestRun = {
    runId,
    projectId,
    status: 'QUEUED',
    startedAt: new Date().toISOString()
  };

  // Persist the newly created test run in DynamoDB.
  await saveTestRun(run);

  console.log(`Created test run: ${run.runId}`);

  return run;
}