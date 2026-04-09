import { Global, Module } from '@nestjs/common';
import { CACHE_PROVIDER } from './interfaces/cache-provider.interface';
import { RedisCacheProvider } from './providers/redis.provider';
import { ProfileCacheService } from './profile-cache.service';
import { UserDashboardCacheService } from './user-dashboard-cache.service';

@Global() // Deixa o provedor acessível em qualquer módulo (Payments, Auth, etc)
@Module({
  providers: [
    {
      provide: CACHE_PROVIDER,
      useClass: RedisCacheProvider,
    },
    ProfileCacheService,
    UserDashboardCacheService,
  ],
  exports: [CACHE_PROVIDER, ProfileCacheService, UserDashboardCacheService],
})
export class CacheModule {}
