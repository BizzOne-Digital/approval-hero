import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Use 308 so POST bodies survive apex → www redirects (301 can drop POST). */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0]?.toLowerCase();
  if (host === 'approvalhero.ca') {
    const url = request.nextUrl.clone();
    url.protocol = 'https';
    url.host = 'www.approvalhero.ca';
    return NextResponse.redirect(url, 308);
  }

  const response = NextResponse.next();
  // Keep Google on the custom domain — do not index *.vercel.app deployment URLs.
  if (host && /\.vercel\.app$/i.test(host)) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)'],
};
