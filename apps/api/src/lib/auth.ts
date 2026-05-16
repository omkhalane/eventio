import { connection } from '@eventio/queue';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { ANONYMOUS_RATE_LIMIT, API_KEYS, PUBLIC_RATE_LIMIT, RATE_LIMIT_WINDOW_MS } from './config.js';
import { sendError } from './response.js';

export type AccessTier = 'anonymous' | 'public' | 'internal';

export interface AuthContext {
  accessTier: AccessTier;
  apiKey?: string;
}

const parseHeaderValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0]?.trim();
  }

  return value?.trim();
};

export const resolveAuthContext = (
  headerValue: string | string[] | undefined,
): AuthContext | null => {
  const apiKey = parseHeaderValue(headerValue);

  if (!apiKey) {
    return { accessTier: 'anonymous' };
  }

  if (API_KEYS.internal.has(apiKey)) {
    return { accessTier: 'internal', apiKey };
  }

  if (API_KEYS.public.has(apiKey)) {
    return { accessTier: 'public', apiKey };
  }

  return null;
};

export const applyApiAuth = async (request: FastifyRequest, reply: FastifyReply) => {
  const context = resolveAuthContext(request.headers['x-api-key']);

  if (!context) {
    return sendError(reply, 401, 'Unauthorized');
  }

  (request as FastifyRequest & { authContext?: AuthContext }).authContext = context;

  if (context.accessTier === 'internal') {
    reply.header('X-RateLimit-Limit', 'unlimited');
    reply.header('X-RateLimit-Remaining', 'unlimited');
    reply.header('X-RateLimit-Reset', '0');
    return;
  }

  const limit = context.accessTier === 'public' ? PUBLIC_RATE_LIMIT : ANONYMOUS_RATE_LIMIT;
  const identifier = context.apiKey || request.ip || 'anonymous';
  const redisKey = `eventio:api:rate-limit:${context.accessTier}:${identifier}`;
  const windowSeconds = Math.max(1, Math.ceil(RATE_LIMIT_WINDOW_MS / 1000));

  const count = await connection.incr(redisKey);
  if (count === 1) {
    await connection.expire(redisKey, windowSeconds);
  }

  const ttlSeconds = Math.max(await connection.ttl(redisKey), 0);
  const resetAt = Date.now() + ttlSeconds * 1000;
  const remaining = Math.max(limit - count, 0);

  reply.header('X-RateLimit-Limit', String(limit));
  reply.header('X-RateLimit-Remaining', String(remaining));
  reply.header('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));

  if (count > limit) {
    reply.header('Retry-After', String(ttlSeconds || windowSeconds));
    return sendError(reply, 429, 'Rate limit exceeded');
  }
};
