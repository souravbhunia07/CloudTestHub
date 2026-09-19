import { runHandler } from './runHandler';

// Simulate an API Gateway request and verify that a test run is queued.
async function main(): Promise<void> {
  // Build a request that resembles an API Gateway POST /runs event.
  const event = {
    body: JSON.stringify({
      projectId: 'demo-project'
    })
  };

  // Execute the API handler with the simulated request.
  const response = await runHandler(event);

  // Print the HTTP-style response for verification.
  console.log('API response:');
  console.log(response);
}

// Execute the local API handler test.
main().catch((error) => {
  console.error('API test failed:', error);
  process.exit(1);
});