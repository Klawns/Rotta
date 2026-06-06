import type { NextRequest } from 'next/server';
import { resolveApiOrigin } from './resolve-api-origin.mjs';

const HOP_BY_HOP_HEADERS = [
  'connection',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
] as const;

const REQUEST_HEADERS_TO_REMOVE = [
  ...HOP_BY_HOP_HEADERS,
  'content-length',
] as const;

const RESPONSE_HEADERS_TO_REMOVE = [
  ...HOP_BY_HOP_HEADERS,
  'content-encoding',
  'content-length',
] as const;

function buildProxyHeaders(request: NextRequest) {
  const headers = new Headers(request.headers);

  for (const headerName of REQUEST_HEADERS_TO_REMOVE) {
    headers.delete(headerName);
  }

  headers.set('accept-encoding', 'identity');
  headers.set('x-forwarded-host', request.nextUrl.host);
  headers.set('x-forwarded-proto', request.nextUrl.protocol.replace(':', ''));

  return headers;
}

function buildProxyResponseHeaders(upstreamHeaders: Headers) {
  const headers = new Headers(upstreamHeaders);

  for (const headerName of RESPONSE_HEADERS_TO_REMOVE) {
    headers.delete(headerName);
  }

  return headers;
}

export async function proxyToBackend(
  request: NextRequest,
  upstreamPath: string,
) {
  const backendOrigin = resolveApiOrigin();
  const targetUrl = new URL(upstreamPath, `${backendOrigin}/`);

  targetUrl.search = request.nextUrl.search;

  try {
    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
    const upstreamResponse = await fetch(targetUrl, {
      method: request.method,
      headers: buildProxyHeaders(request),
      body: hasBody ? request.body : undefined,
      duplex: hasBody ? 'half' : undefined,
      redirect: 'manual',
      cache: 'no-store',
    } as RequestInit & { duplex?: 'half' });

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: buildProxyResponseHeaders(upstreamResponse.headers),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown proxy error';

    return Response.json(
      {
        message: 'Failed to reach backend service.',
        cause: message,
      },
      { status: 502 },
    );
  }
}
