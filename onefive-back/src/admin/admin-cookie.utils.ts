import { FastifyReply } from 'fastify';
import { ADMIN_COOKIE_NAME } from './admin.constants';

const isProduction = () => process.env.NODE_ENV === 'production';

export function setAdminAuthCookie(
  reply: FastifyReply,
  token: string,
  maxAgeSeconds: number,
) {
  reply.setCookie(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  });
}

export function clearAdminAuthCookie(reply: FastifyReply) {
  reply.clearCookie(ADMIN_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
  });
}
