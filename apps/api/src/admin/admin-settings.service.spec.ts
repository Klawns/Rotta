/* eslint-disable @typescript-eslint/unbound-method -- Jest mock assertions intentionally inspect service dependencies. */
import type { ICacheProvider } from '../cache/interfaces/cache-provider.interface';
import { AdminSettingsService } from './admin-settings.service';
import type { IAdminSettingsRepository } from './interfaces/admin-settings-repository.interface';

describe('AdminSettingsService', () => {
  const createService = () => {
    const adminSettingsRepository: jest.Mocked<IAdminSettingsRepository> = {
      getPlans: jest.fn(),
      updatePlan: jest.fn().mockResolvedValue(undefined),
      getConfigs: jest.fn(),
      updateConfig: jest.fn(),
      seedInitialData: jest.fn(),
    };
    const cache: jest.Mocked<ICacheProvider> = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
      getDel: jest.fn(),
      invalidatePrefix: jest.fn(),
    };
    const service = new AdminSettingsService(adminSettingsRepository, cache);

    return {
      service,
      adminSettingsRepository,
      cache,
    };
  };

  it('invalidates public pricing cache after a plan update reaches the source of truth', async () => {
    const { service, adminSettingsRepository, cache } = createService();

    await service.updatePlan('premium', { price: 2490 });

    expect(adminSettingsRepository.updatePlan).toHaveBeenCalledWith('premium', {
      price: 2490,
    });
    expect(cache.del).toHaveBeenCalledWith('pricing:all_plans');
    expect(
      adminSettingsRepository.updatePlan.mock.invocationCallOrder[0],
    ).toBeLessThan(cache.del.mock.invocationCallOrder[0]);
  });

  it('does not invalidate public pricing cache when the source update fails', async () => {
    const { service, adminSettingsRepository, cache } = createService();
    adminSettingsRepository.updatePlan.mockRejectedValueOnce(
      new Error('database failed'),
    );

    await expect(
      service.updatePlan('premium', { price: 2490 }),
    ).rejects.toThrow('database failed');

    expect(cache.del).not.toHaveBeenCalled();
  });

  it('surfaces cache invalidation failures so stale public plans are not hidden', async () => {
    const { service, cache } = createService();
    cache.del.mockRejectedValueOnce(new Error('cache invalidation failed'));

    await expect(
      service.updatePlan('premium', { price: 2490 }),
    ).rejects.toThrow('cache invalidation failed');
  });

  it('invalidates public pricing cache for concurrent plan updates', async () => {
    const { service, cache } = createService();

    await Promise.all([
      service.updatePlan('premium', { price: 2490 }),
      service.updatePlan('lifetime', { price: 7990 }),
    ]);

    expect(cache.del).toHaveBeenCalledTimes(2);
    expect(cache.del).toHaveBeenNthCalledWith(1, 'pricing:all_plans');
    expect(cache.del).toHaveBeenNthCalledWith(2, 'pricing:all_plans');
  });
});
