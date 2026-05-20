import './env.js';

import { loadConfig } from '@eventio/config';
import { logger } from '@eventio/observability';
import cors from '@fastify/cors';
import Fastify from 'fastify';

import { applyApiAuth } from './lib/auth.js';
import { handleApiRequest } from './lib/event-api.js';
import { runMigrations } from './lib/migrations.js';
import { sendError } from './lib/response.js';

const config = loadConfig();

function getCorsOrigins() {
  const origins = [config.frontendUrl, config.siteUrl, config.apiBaseUrl].filter(
    (origin): origin is string => typeof origin === 'string' && origin.length > 0,
  );

  if (config.isDevelopment) {
    origins.push(
      'http://localhost:5173',
      'http://localhost:5175',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5175',
    );
  }

  return Array.from(new Set(origins));
}

const fastify = Fastify({
  logger: {
    level: config.logLevel,
  },
});

fastify.register(cors, {
  origin: getCorsOrigins(),
  credentials: true,
});

fastify.addHook('onRequest', applyApiAuth);

fastify.addHook('onSend', async (_request, reply, payload) => {
  reply
    .header('X-Content-Type-Options', 'nosniff')
    .header('X-Frame-Options', 'DENY')
    .header('Referrer-Policy', 'strict-origin-when-cross-origin')
    .header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return payload;
});

fastify.get('/healthz', async () => ({ status: 'ok' }));

fastify.setErrorHandler((error, _request, reply) => {
  logger.error({ err: error }, 'Unhandled API error');
  return sendError(reply, 500, 'Internal Server Error');
});

fastify.route({
  method: ['GET', 'POST'],
  url: '/api/v1/*',
  handler: async (request, reply) => {
    const pathname = request.url.split('?')[0] || '/';
    const result = await handleApiRequest(
      request.method,
      pathname,
      request.query as Record<string, string | string[] | undefined>,
      request.body,
    );

    for (const [name, value] of Object.entries(result.headers || {})) {
      reply.header(name, value);
    }

    return reply.status(result.status).send(result.body);
  },
});

const start = async () => {
  try {
    await runMigrations();

    await fastify.listen({ port: config.apiPort, host: config.apiHost });
    logger.info({ host: config.apiHost, port: config.apiPort }, 'API server listening');
  } catch (error) {
    logger.error({ err: error }, 'API startup failed');
    process.exit(1);
  }
};

async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down API server');
  await fastify.close();
  process.exit(0);
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

start();
