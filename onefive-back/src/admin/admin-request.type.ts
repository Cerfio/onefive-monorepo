import { FastifyRequest } from 'fastify';

export interface FastifyAdminRequest extends FastifyRequest {
  adminUserId: string;
  adminToken: string;
  adminPermissions: string[];
  isSuperAdmin: boolean;
}
