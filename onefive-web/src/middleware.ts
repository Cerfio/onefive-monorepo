import { NextRequest, NextResponse } from 'next/server';

export default function middleware(_request: NextRequest, _response: NextResponse) {
  return NextResponse.next();
}
export const config = {
  // Skip all paths that should not be internationalized. This example skips
  // certain folders and all pathnames with a dot (e.g. favicon.ico)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
