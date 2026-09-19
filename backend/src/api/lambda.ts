import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from 'aws-lambda';

import { runHandler } from './runHandler';
import { statusHandler } from './statusHandler';

// Route API Gateway requests to the appropriate CloudTestHub operation.
export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  // Route GET /runs/{runId} requests to the test-run status handler.
  if (event.httpMethod === 'GET') {
    return statusHandler({
      pathParameters: event.pathParameters ?? undefined
    });
  }

  // Route POST /runs requests to the test-run creation handler.
  if (event.httpMethod === 'POST') {
    return runHandler({
      body: event.body ?? undefined
    });
  }

  // Reject HTTP methods that CloudTestHub does not currently support.
  return {
    statusCode: 405,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      error: 'Method not allowed'
    })
  };
}