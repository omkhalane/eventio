import { handleApiRequest } from '../../apps/api/lib/event-api';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const { method, url, query, body } = request;

  try {
    // Extract pathname without query string
    const pathname = url ? url.split('?')[0] : '/';
    
    const result = await handleApiRequest(
      method || 'GET',
      pathname,
      query as Record<string, string | string[] | undefined>,
      body
    );

    response.status(result.status);
    if (result.headers) {
      for (const [key, value] of Object.entries(result.headers)) {
        response.setHeader(key, value as string);
      }
    }
    response.json(result.body);
  } catch (error) {
    console.error('API Error:', error);
    response.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
