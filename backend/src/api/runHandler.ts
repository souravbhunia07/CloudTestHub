import { createTestRun } from '../database/createTestRun';
import { sendTestRunMessage } from '../queue/sqs';

// Create a queued test run and publish its execution job to SQS.
export async function runHandler(event: {
  body?: string;
}): Promise<{
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}> {
  // Parse the incoming API request body.
  let body: { projectId?: string };

  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    // Return a client error when the request body is invalid JSON.
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Request body must contain valid JSON'
      })
    };
  }

  // Validate that the caller supplied a project identifier.
  if (!body.projectId || body.projectId.trim() === '') {
    // Return a client error when projectId is missing.
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'projectId is required'
      })
    };
  }

  try {
    // Create the test-run record in DynamoDB with QUEUED status.
    const run = await createTestRun(body.projectId);

    // Publish the run to SQS so the worker can execute it asynchronously.
    await sendTestRunMessage(
      run.runId,
      run.projectId
    );

    // Return the queued run information immediately without waiting for execution.
    return {
      statusCode: 202,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        runId: run.runId,
        projectId: run.projectId,
        status: run.status
      })
    };
  } catch (error) {
    // Log unexpected backend errors for debugging and CI visibility.
    console.error('Failed to queue test run:', error);

    // Return a generic server error without exposing internal implementation details.
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to queue test run'
      })
    };
  }
}