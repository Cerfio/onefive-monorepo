import { NextRequest, NextResponse } from 'next/server';

// Routes réservées aux membres SANS variante publique (pas d'AuthSwitch).
// On NE gate PAS /feed, /profile, /post, /discussion(s), /startup : ils ont
// une vue publique (mur d'inscription) gérée côté page.
const PROTECTED_PREFIXES = [
  '/network',
  '/spotlight',
  '/messages',
  '/analytics',
  '/my-investments',
  '/relationships',
  '/settings',
  '/dataroom',
];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !request.cookies.get('token')) {
    // Durcissement : rediriger côté serveur AVANT le montage de la page
    // (le gating client `withAuth` reste en second rideau).
    const url = request.nextUrl.clone();
    url.pathname = '/signin';
    url.search = `?returnUrl=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip all paths that should not be internationalized. This example skips
  // certain folders and all pathnames with a dot (e.g. favicon.ico)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
