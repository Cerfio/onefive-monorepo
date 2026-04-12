import { FastifyReply } from 'fastify';

/**
 * Configuration centralisée des cookies d'authentification.
 * Le cookie `token` est httpOnly pour empêcher l'accès via JavaScript (protection XSS).
 * Le cookie `is_authenticated` est un flag non-sensible pour que le frontend détecte l'état auth.
 */
export const AUTH_COOKIE_NAME = 'token';
export const AUTH_FLAG_COOKIE_NAME = 'is_authenticated';

const isProduction = () => process.env.NODE_ENV === 'production';

export interface AuthCookieOptions {
  maxAge?: number; // seconds
}

/**
 * Set les cookies d'authentification côté serveur.
 *
 * 1. `token` (httpOnly) → contient le session ID signé HMAC — inaccessible à document.cookie
 * 2. `is_authenticated` (non-httpOnly) → flag "1" pour que le frontend détecte l'état auth
 *    sans exposer le token. Ne contient aucune donnée sensible.
 */
export function setAuthCookie(
  reply: FastifyReply,
  token: string,
  options?: AuthCookieOptions,
): void {
  const maxAge = options?.maxAge ?? 30 * 24 * 60 * 60; // 30 jours par défaut

  // ✅ Cookie principal — httpOnly, invisible à JavaScript
  reply.setCookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true, // ✅ Protection XSS — inaccessible à document.cookie
    secure: isProduction(), // ✅ HTTPS only en production
    sameSite: 'lax', // ✅ Protection CSRF (lax pour OAuth redirects)
    path: '/', // ✅ Disponible sur toutes les routes
    maxAge, // ✅ Durée de vie en secondes
  });

  // ✅ Cookie flag — lisible par le frontend pour détecter l'état auth
  // Ne contient AUCUNE donnée sensible (juste "1")
  reply.setCookie(AUTH_FLAG_COOKIE_NAME, '1', {
    httpOnly: false, // Accessible au frontend
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
}

/**
 * Supprime les cookies d'authentification.
 * Utilisé lors du logout pour invalider côté client.
 */
export function clearAuthCookie(reply: FastifyReply): void {
  reply.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
  });

  reply.clearCookie(AUTH_FLAG_COOKIE_NAME, {
    httpOnly: false,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
  });
}
