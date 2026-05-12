import { logger } from '@eventio/observability';
import cors from '@fastify/cors';
import Fastify from 'fastify';

import { applyApiAuth } from './lib/auth';
import { runMigrations } from './lib/migrations';
import { buildEventResponse, buildEventsQuery, buildStats, parseEventsQuery } from './lib/query';
import { sendError } from './lib/response';

const fastify = Fastify({
  logger: false,
});

fastify.register(cors, {
  origin: process.env.FRONTEND_URL || '*',
});

fastify.addHook('onRequest', applyApiAuth);

fastify.setErrorHandler((error, _request, reply) => {
  logger.error({ err: error }, 'Unhandled API error');
  return sendError(reply, 500, 'Internal Server Error');
});

fastify.get('/api/v1/stats', async (_request, reply) => {
  const data = await buildStats();
  return reply.send({ data });
});

fastify.get('/api/v1/events', async (request, reply) => {
  const parsed = parseEventsQuery(request.query as Record<string, string | string[] | undefined>);

  if ('message' in parsed) {
    return sendError(reply, 400, parsed.message, parsed.extra);
  }

  const { rows, pagination } = await buildEventsQuery(parsed);
  const data = rows.map(buildEventResponse);

  return reply.send({ data, pagination });
});

const start = async () => {
  try {
    await runMigrations();

    const port = Number(process.env.PORT || 3000);
    await fastify.listen({ port, host: '0.0.0.0' });
    logger.info(`API server listening on port ${port}`);
  } catch (error) {
    logger.error({ err: error }, 'API startup failed');
    process.exit(1);
  }
};

start();
