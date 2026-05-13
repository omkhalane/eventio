import type { FastifyReply } from 'fastify';

export const sendSuccess = <T>(reply: FastifyReply, data: T, extra?: Record<string, unknown>) =>
  reply.send({ success: true, data, ...(extra || {}) });

export const sendError = (
  reply: FastifyReply,
  statusCode: number,
  error: string,
  extra?: Record<string, unknown>,
) => reply.status(statusCode).send({ success: false, error, ...(extra || {}) });
