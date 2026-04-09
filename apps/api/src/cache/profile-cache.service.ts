import { Inject, Injectable } from '@nestjs/common';

import { CACHE_PROVIDER } from './interfaces/cache-provider.interface';
import type { ICacheProvider } from './interfaces/cache-provider.interface';

const PROFILE_CACHE_TTL_SECONDS = 600;

@Injectable()
export class ProfileCacheService {
  constructor(@Inject(CACHE_PROVIDER) private readonly cache: ICacheProvider) {}

  private getProfileCacheKey(userId: string) {
    return `profile:${userId}`;
  }

  async get<T>(userId: string): Promise<T | null> {
    return this.cache.get<T>(this.getProfileCacheKey(userId));
  }

  async set(userId: string, profile: unknown): Promise<void> {
    await this.cache.set(
      this.getProfileCacheKey(userId),
      profile,
      PROFILE_CACHE_TTL_SECONDS,
    );
  }

  async invalidate(userId: string): Promise<void> {
    await this.cache.del(this.getProfileCacheKey(userId));
  }
}
