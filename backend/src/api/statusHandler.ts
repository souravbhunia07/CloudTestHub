import { getTestRun } from '../database/dynamodb';

// Return the current status and metadata for a CloudTestHub test run.
export async function statusHandler(event: {
  pathParameters?: {
    runId?: string;
  };
}): Promise<{
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}> {
  // Extract the run ID from the API Gateway path parameters.
  const runId = event.pathParameters?.runId;

  // Reject requests that do not contain a run ID.
  if (!runId || runId.trim() === '') {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'runId is required'
      })
    };
  }

  try {
    // Retrieve the test run from DynamoDB.
    const run = await getTestRun(runId);

    // Return 404 when the requested run does not exist.
    if (!run) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Test run not found'
        })
      };
    }

    // Return the stored test-run information to the API caller.
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(run)
    };
  } catch (error) {
    // Log unexpected database/API failures for debugging.
    console.error(`Failed to retrieve test run ${runId}:`, error);

    // Return a generic server error without exposing internal details.
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to retrieve test run'
      })
    };
  }
}