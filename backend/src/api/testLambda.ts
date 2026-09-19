import { handler } from './lambda';

// Verify that the Lambda entry point routes different HTTP methods correctly.
async function main(): Promise<void> {
  // Use the previously successful run to test the GET status route.
  const runId = '8ba4508a-8f3a-4be9-ae39-0102ca026b37';

  // Simulate API Gateway calling GET /runs/{runId}.
  const getResponse = await handler({
    httpMethod: 'GET',
    pathParameters: {
      runId
    }
  } as any);

  // Print the GET response for verification.
  console.log('GET /runs/{runId}:');
  console.log(JSON.stringify(getResponse, null, 2));

  // Simulate API Gateway calling POST /runs.
  const postResponse = await handler({
    httpMethod: 'POST',
    pathParameters: null,
    body: JSON.stringify({
      projectId: 'lambda-test-project'
    })
  } as any);

  // Print the POST response for verification.
  console.log('POST /runs:');
  console.log(JSON.stringify(postResponse, null, 2));
}

// Run the local Lambda test and fail on unexpected errors.
main().catch((error) => {
  console.error('Lambda test failed:', error);
  process.exit(1);
});