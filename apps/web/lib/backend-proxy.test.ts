import assert from 'node:assert/strict';
import test from 'node:test';
import type { NextRequest } from 'next/server';
import { proxyToBackend } from './backend-proxy';

const originalFetch = globalThis.fetch;

function createProxyRequest(
  headers: HeadersInit = {},
  nextUrl = 'https://frontend.test/api/auth/me?include=session',
) {
  return {
    method: 'GET',
    headers: new Headers(headers),
    body: null,
    nextUrl: new URL(nextUrl),
  } as unknown as NextRequest;
}

test('removes response body framing and compression headers from backend responses', async (t) => {
  let upstreamRequestHeaders = new Headers();

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = (async (_input, init) => {
    upstreamRequestHeaders = new Headers(init?.headers);

    return new Response(JSON.stringify({ id: 'user-1' }), {
      status: 200,
      statusText: 'OK',
      headers: {
        connection: 'keep-alive',
        'content-encoding': 'gzip',
        'content-length': '128',
        'content-type': 'application/json',
        'transfer-encoding': 'chunked',
      },
    });
  }) as typeof fetch;

  const response = await proxyToBackend(
    createProxyRequest({ 'accept-encoding': 'gzip, br' }),
    '/auth/me',
  );

  assert.equal(response.status, 200);
  assert.equal(response.statusText, 'OK');
  assert.equal(response.headers.get('content-encoding'), null);
  assert.equal(response.headers.get('content-length'), null);
  assert.equal(response.headers.get('transfer-encoding'), null);
  assert.equal(response.headers.get('connection'), null);
  assert.equal(response.headers.get('content-type'), 'application/json');
  assert.equal(upstreamRequestHeaders.get('accept-encoding'), 'identity');
  assert.deepEqual(await response.json(), { id: 'user-1' });
});

test('preserves functional response headers from backend responses', async (t) => {
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'cache-control': 'no-store',
        'content-type': 'application/json; charset=utf-8',
        'set-cookie': 'session=abc; Path=/; HttpOnly',
      },
    })) as typeof fetch;

  const response = await proxyToBackend(createProxyRequest(), '/auth/me');

  assert.equal(
    response.headers.get('content-type'),
    'application/json; charset=utf-8',
  );
  assert.equal(response.headers.get('set-cookie'), 'session=abc; Path=/; HttpOnly');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { ok: true });
});
