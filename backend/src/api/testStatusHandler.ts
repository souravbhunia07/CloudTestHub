// import { statusHandler } from './statusHandler';

// // Verify that CloudTestHub can retrieve a completed test run.
// async function main(): Promise<void> {
//   // Use the successful run created during our end-to-end test.
//   const runId = '8ba4508a-8f3a-4be9-ae39-0102ca026b37';

//   // Simulate an API Gateway request containing the run ID.
//   const response = await statusHandler({
//     pathParameters: {
//       runId
//     }
//   });

//   // Print the simulated HTTP response.
//   console.log(JSON.stringify(response, null, 2));
// }

// // Run the local API test and fail the process on unexpected errors.
// main().catch((error) => {
//   console.error('Status handler test failed:', error);
//   process.exit(1);
// });

// Failure
// import { statusHandler } from './statusHandler';

// // Verify the status API returns 404 for a run that does not exist.
// async function main(): Promise<void> {
//   // Use a deliberately fake run ID to test the not-found path.
//   const response = await statusHandler({
//     pathParameters: {
//       runId: '00000000-0000-0000-0000-000000000000'
//     }
//   });

//   // Print the simulated HTTP response for inspection.
//   console.log(JSON.stringify(response, null, 2));
// }

// // Run the local API test and fail the process on unexpected errors.
// main().catch((error) => {
//   console.error('Status handler test failed:', error);
//   process.exit(1);
// });

// Failure - when run id is not provided
import { statusHandler } from './statusHandler';

// Verify the status API rejects requests that do not contain a run ID.
async function main(): Promise<void> {
  // Simulate an API Gateway request with no runId parameter.
  const response = await statusHandler({
    pathParameters: {}
  });

  // Print the simulated HTTP response for inspection.
  console.log(JSON.stringify(response, null, 2));
}

// Run the local API test and fail the process on unexpected errors.
main().catch((error) => {
  console.error('Status handler test failed:', error);
  process.exit(1);
});