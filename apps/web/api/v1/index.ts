import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleApiRequest } from '../../../apps/api/lib/event-api';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const { method, url, query, body } = request;

  try {
    // Normalize path for internal handler
    const path = url?.replace('/api/v1', '') || '/';
    
    const result = await handleApiRequest(
      method || 'GET',
      url || '/',
      query as Record<string, string | string[] | undefined>,
      body
    );

    response.status(result.status);
    if (result.headers) {
      for (const [key, value] of Object.entries(result.headers)) {
        response.setHeader(key, value);
      }
    }
    response.json(result.body);
  } catch (error) {
    console.error('API Error:', error);
    response.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
