import { Injectable, Inject } from '@nestjs/common';
import { AbacatePayProvider } from '../payments/providers/abacatepay.provider';
import { PAYMENT_PROVIDER } from '../payments/providers/payment-provider.interface';
import { IAdminRepository } from './interfaces/admin-repository.interface';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CACHE_PROVIDER } from '../cache/interfaces/cache-provider.interface';
import type { ICacheProvider } from '../cache/interfaces/cache-provider.interface';

@Injectable()
export class AdminService {
  private readonly adminEmail = 'admin@mdc.com';

  constructor(
    @Inject(IAdminRepository)
    private readonly adminRepository: IAdminRepository,
    @Inject(PAYMENT_PROVIDER)
    private abacatePay: AbacatePayProvider,
    private readonly subscriptionsService: SubscriptionsService,
    @Inject(CACHE_PROVIDER)
    private readonly cache: ICacheProvider,
  ) { }

  async getStats() {
    const usersCount = await this.adminRepository.getUsersCount(
      this.adminEmail,
    );
    const activeSubscriptions =
      await this.adminRepository.getActiveSubscriptionsCount();

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const revenueData = await this.abacatePay.getRevenue(startDate, endDate);

    return {
      totalUsers: usersCount,
      activeSubscriptions: activeSubscriptions,
      revenue30d: revenueData?.total || 0,
    };
  }

  async getRecentUsers(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const usersData = await this.adminRepository.getRecentUsers(
      this.adminEmail,
      limit,
      offset,
    );
    const totalCount = usersData.total;
    const totalPages = Math.ceil(totalCount / limit);

    const now = new Date();

    const mappedData = usersData.data.map((user) => {
      let daysLeft = null;
      if (user.plan === 'premium' && (user as any).validUntil) {
        const validUntilDate = new Date((user as any).validUntil);
        const diffTime = validUntilDate.getTime() - now.getTime();
        daysLeft = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
      }
      return {
        ...user,
        daysLeft
      };
    });

    return {
      data: mappedData,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages,
      },
    };
  }

  async updateUserPlan(userId: string, plan: 'starter' | 'premium' | 'lifetime') {
    const result = await this.subscriptionsService.overridePlan(userId, plan);
    // Invalidating user cache so frontend updates gracefully
    await this.cache.del(`profile:${userId}`);
    return result;
  }

  async deleteUser(id: string) {
    return this.adminRepository.deleteUser(id);
  }
}
