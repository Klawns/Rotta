import { Test, TestingModule } from '@nestjs/testing';

import { CACHE_PROVIDER } from './interfaces/cache-provider.interface';
import { UserDashboardCacheService } from './user-dashboard-cache.service';

function createMemoryCache() {
  const store = new Map<string, string>();

  return {
    get: jest.fn(async <T>(key: string) => {
      const value = store.get(key);
      return value ? (JSON.parse(value) as T) : null;
    }),
    set: jest.fn(async (key: string, value: unknown) => {
      store.set(key, JSON.stringify(value));
    }),
    del: jest.fn(async (key: string) => {
      store.delete(key);
    }),
    getDel: jest.fn(async <T>(key: string) => {
      const value = store.get(key);
      store.delete(key);
      return value ? (JSON.parse(value) as T) : null;
    }),
    invalidatePrefix: jest.fn(async (prefix: string) => {
      for (const key of Array.from(store.keys())) {
        if (key.startsWith(prefix)) {
          store.delete(key);
        }
      }
    }),
  };
}

describe('UserDashboardCacheService', () => {
  it('should centralize stats and frequent-clients reads with consistent keys and TTLs', async () => {
    const cacheMock = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
      getDel: jest.fn().mockResolvedValue(null),
      invalidatePrefix: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDashboardCacheService,
        { provide: CACHE_PROVIDER, useValue: cacheMock },
      ],
    }).compile();

    const service = module.get<UserDashboardCacheService>(
      UserDashboardCacheService,
    );
    const stats = { count: 3, totalValue: 42, rides: [] };
    const frequentClients = [{ id: 'client-1', name: 'Ana' }];

    await service.setStats('user-1', 'month', stats);
    await service.setFrequentClients('user-1', frequentClients);

    expect(cacheMock.set).toHaveBeenNthCalledWith(
      1,
      'stats:user-1:month',
      stats,
      300,
    );
    expect(cacheMock.set).toHaveBeenNthCalledWith(
      2,
      'frequent-clients:user-1',
      frequentClients,
      1800,
    );

    cacheMock.get
      .mockResolvedValueOnce(stats)
      .mockResolvedValueOnce(frequentClients);

    await expect(service.getStats('user-1', 'month')).resolves.toEqual(stats);
    await expect(service.getFrequentClients('user-1')).resolves.toEqual(
      frequentClients,
    );
  });

  it('should invalidate all stats entries for a user by prefix and remove frequent clients', async () => {
    const cache = createMemoryCache();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDashboardCacheService,
        { provide: CACHE_PROVIDER, useValue: cache },
      ],
    }).compile();

    const service = module.get<UserDashboardCacheService>(
      UserDashboardCacheService,
    );

    await cache.set('stats:user-1:today', { count: 1 });
    await cache.set('stats:user-1:rolling-30d', { count: 2 });
    await cache.set('finance-dashboard:user-1:month:all:2026-04-01:2026-04-30', {
      count: 9,
    });
    await cache.set('frequent-clients:user-1', [{ id: 'client-1' }]);
    await cache.set('stats:user-2:today', { count: 3 });
    await cache.set('finance-dashboard:user-2:month:all:2026-04-01:2026-04-30', {
      count: 4,
    });

    await service.invalidate('user-1');

    expect(cache.invalidatePrefix).toHaveBeenCalledWith('stats:user-1:');
    expect(cache.invalidatePrefix).toHaveBeenCalledWith(
      'finance-dashboard:user-1:',
    );
    expect(cache.del).toHaveBeenCalledWith('frequent-clients:user-1');
    await expect(cache.get('stats:user-1:today')).resolves.toBeNull();
    await expect(cache.get('stats:user-1:rolling-30d')).resolves.toBeNull();
    await expect(
      cache.get('finance-dashboard:user-1:month:all:2026-04-01:2026-04-30'),
    ).resolves.toBeNull();
    await expect(cache.get('frequent-clients:user-1')).resolves.toBeNull();
    await expect(cache.get('stats:user-2:today')).resolves.toEqual({
      count: 3,
    });
    await expect(
      cache.get('finance-dashboard:user-2:month:all:2026-04-01:2026-04-30'),
    ).resolves.toEqual({
      count: 4,
    });
  });
});
