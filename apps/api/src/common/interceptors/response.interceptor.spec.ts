import { of, lastValueFrom } from 'rxjs';
import type { Observable } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';

describe('ResponseInterceptor', () => {
  const interceptor = new ResponseInterceptor();

  it('unwraps collection payloads with flat metadata', async () => {
    const stream = interceptor.intercept({} as never, {
      handle: () =>
        of({
          rides: [{ id: 'ride-1' }],
          nextCursor: 'cursor-2',
          hasMore: true,
        }),
    }) as Observable<{
      data: Array<{ id: string }>;
      meta: { nextCursor: string; hasMore: boolean };
    }>;

    const result = await lastValueFrom(stream);

    expect(result).toEqual({
      data: [{ id: 'ride-1' }],
      meta: {
        hasMore: true,
        nextCursor: 'cursor-2',
      },
    });
  });

  it('preserves composite payloads with structured metadata', async () => {
    const stream = interceptor.intercept({} as never, {
      handle: () =>
        of({
          rides: [{ id: 'ride-1' }],
          period: {
            start: '2026-04-01T00:00:00.000Z',
            end: '2026-04-01T23:59:59.999Z',
          },
        }),
    }) as Observable<{
      data: {
        rides: Array<{ id: string }>;
        period: { start: string; end: string };
      };
      meta: Record<string, never>;
    }>;

    const result = await lastValueFrom(stream);

    expect(result).toEqual({
      data: {
        rides: [{ id: 'ride-1' }],
        period: {
          start: '2026-04-01T00:00:00.000Z',
          end: '2026-04-01T23:59:59.999Z',
        },
      },
      meta: {},
    });
  });
});
