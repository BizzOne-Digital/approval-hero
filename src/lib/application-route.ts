import type { NextRequest } from 'next/server';

export function getApplicationToken(req: NextRequest, body?: Record<string, unknown>): string | null {
  const header = req.headers.get('x-application-token');
  if (header) return header;

  if (body?.token && typeof body.token === 'string') return body.token;

  const queryToken = req.nextUrl.searchParams.get('token');
  if (queryToken) return queryToken;

  return null;
}

export function getClientIp(req: NextRequest): string | undefined {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    undefined
  );
}
