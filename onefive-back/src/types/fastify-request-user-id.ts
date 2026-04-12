import { FastifyRequest } from 'fastify';
import { Session } from '@prisma/client';

export interface FastifyRequestUserId extends FastifyRequest {
  userId: string;
  session: Session;
}
