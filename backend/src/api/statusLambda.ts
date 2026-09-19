import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from 'aws-lambda';

import { statusHandler } from './statusHandler';

// Adapt an API Gateway request into CloudTestHub's status handler.
export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  // Pass the path parameters to the internal status handler.
  return statusHandler({
    pathParameters: event.pathParameters ?? undefined
  });
}