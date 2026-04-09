import { Injectable, Inject, Logger } from '@nestjs/common';

import { CACHE_PROVIDER } from './interfaces/cache-provider.interface';
import type { ICacheProvider } from './interfaces/cache-provider.interface';

const DASHBOARD_STATS_CACHE_TTL_SECONDS = 300;
const FREQUENT_CLIENTS_CACHE_TTL_SECONDS = 1800;

@Injectable()
export class UserDashboardCacheService {
  private readonly logger = new Logger(UserDashboardCacheService.name);

  constructor(@Inject(CACHE_PROVIDER) private readonly cache: ICacheProvider) {}

  private getStatsCacheKey(userId: string, period: string) {
    return `stats:${userId}:${period}`;
  }

  private getStatsCachePrefix(userId: string) {
    return `stats:${userId}:`;
  }

  private getFrequentClientsCacheKey(userId: string) {
    return `frequent-clients:${userId}`;
  }

  private getFinanceDashboardCachePrefix(userId: string) {
    return `finance-dashboard:${userId}:`;
  }

  async getStats<T>(userId: string, period: string): Promise<T | null> {
    return this.cache.get<T>(this.getStatsCacheKey(userId, period));
  }

  async setStats(
    userId: string,
    period: string,
    value: unknown,
  ): Promise<void> {
    await this.cache.set(
      this.getStatsCacheKey(userId, period),
      value,
      DASHBOARD_STATS_CACHE_TTL_SECONDS,
    );
  }

  async getFrequentClients<T>(userId: string): Promise<T | null> {
    return this.cache.get<T>(this.getFrequentClientsCacheKey(userId));
  }

  async setFrequentClients(userId: string, value: unknown): Promise<void> {
    await this.cache.set(
      this.getFrequentClientsCacheKey(userId),
      value,
      FREQUENT_CLIENTS_CACHE_TTL_SECONDS,
    );
  }

  async invalidate(userId: string) {
    await Promise.all([
      this.cache.invalidatePrefix(this.getStatsCachePrefix(userId)),
      this.cache.invalidatePrefix(this.getFinanceDashboardCachePrefix(userId)),
      this.cache.del(this.getFrequentClientsCacheKey(userId)),
    ]);

    this.logger.debug(
      `[UserDashboardCacheService] Cache invalidado para usuario ${userId}`,
    );
  }
}
