import type { ConfigService } from '@nestjs/config';

import { AdminService } from './admin.service';
import type { IAdminRepository } from './interfaces/admin-repository.interface';
import type { IPaymentProvider } from '../payments/providers/payment-provider.interface';
import type { ICacheProvider } from '../cache/interfaces/cache-provider.interface';
import type { IPaymentsRepository } from '../payments/interfaces/payments-repository.interface';
import type { SubscriptionsService } from '../subscriptions/subscriptions.service';
import type { ProfileCacheService } from '../cache/profile-cache.service';
import type { UsersService } from '../users/users.service';

describe('AdminService billing summary', () => {
  const createService = () => {
    const adminRepository = {
      getUsersCount: jest.fn(),
      getActiveSubscriptionsCount: jest.fn(),
      getRecentUsers: jest.fn(),
      deleteUser: jest.fn(),
    } as unknown as jest.Mocked<IAdminRepository>;

    const paymentProvider: IPaymentProvider = {
      createCheckoutSession: jest.fn(),
      handleWebhook: jest.fn(),
    };

    const paymentsRepository = {
      getPlanById: jest.fn(),
      getAllPlans: jest.fn(),
      updatePlan: jest.fn(),
    } as unknown as jest.Mocked<IPaymentsRepository>;

    const subscriptionsService = {
      overridePlan: jest.fn(),
      updateOrCreate: jest.fn(),
    } as unknown as jest.Mocked<SubscriptionsService>;

    const profileCacheService = {
      invalidate: jest.fn(),
    } as unknown as jest.Mocked<ProfileCacheService>;

    const usersService = {
      create: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    const configService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    const cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      getDel: jest.fn(),
      invalidatePrefix: jest.fn(),
    } as unknown as jest.Mocked<ICacheProvider>;

    const service = new AdminService(
      adminRepository,
      paymentProvider,
      paymentsRepository,
      subscriptionsService,
      profileCacheService,
      usersService,
      configService,
      cache,
    );

    return {
      service,
      paymentProvider,
      paymentsRepository,
      configService,
    };
  };

  it('returns read-only capability and zeroed fallbacks when the gateway is disabled', async () => {
    const { service, paymentsRepository, configService } = createService();

    configService.get.mockImplementation((key: string) => {
      if (key === 'PAYMENT_GATEWAY') {
        return 'disabled';
      }

      return undefined;
    });
    paymentsRepository.getAllPlans.mockResolvedValue([
      {
        id: 'starter',
        name: 'Starter',
        price: 0,
        interval: null,
        description: 'Plano inicial',
        features: '[]',
        cta: 'Comecar',
        highlight: false,
        updatedAt: new Date('2026-04-20T00:00:00.000Z'),
      },
    ]);

    await expect(service.getBillingSummary()).resolves.toEqual({
      gateway: {
        status: 'readOnly',
        provider: null,
        message:
          'Gateway ainda nao configurado. O admin pode manter os planos prontos para a integracao futura.',
      },
      metrics: {
        activePlans: 1,
        highlightedPlanName: null,
        monthlyRevenueInCents: 0,
        annualRevenueInCents: null,
      },
    });
  });

  it('returns enabled capability with provider metadata and highlighted plan', async () => {
    const { service, paymentsRepository, configService, paymentProvider } =
      createService();

    configService.get.mockImplementation((key: string) => {
      if (key === 'PAYMENT_GATEWAY') {
        return 'abacatepay';
      }

      return undefined;
    });
    paymentProvider.getRevenue = jest.fn().mockResolvedValue({ total: 4990 });
    paymentsRepository.getAllPlans.mockResolvedValue([
      {
        id: 'premium',
        name: 'Premium',
        price: 4990,
        interval: '/mes',
        description: 'Plano premium',
        features: '[]',
        cta: 'Assinar',
        highlight: true,
        updatedAt: new Date('2026-04-20T00:00:00.000Z'),
      },
      {
        id: 'lifetime',
        name: 'Lifetime',
        price: 49700,
        interval: null,
        description: 'Plano vitalicio',
        features: '[]',
        cta: 'Comprar',
        highlight: false,
        updatedAt: new Date('2026-04-20T00:00:00.000Z'),
      },
    ]);

    await expect(service.getBillingSummary()).resolves.toEqual({
      gateway: {
        status: 'enabled',
        provider: 'abacatepay',
        message:
          'Gateway configurado. Checkout e conciliacao podem evoluir sobre este provider.',
      },
      metrics: {
        activePlans: 2,
        highlightedPlanName: 'Premium',
        monthlyRevenueInCents: 4990,
        annualRevenueInCents: null,
      },
    });
  });
});
