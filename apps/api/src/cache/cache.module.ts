import { Global, Module } from '@nestjs/common';
import { CACHE_PROVIDER } from './interfaces/cache-provider.interface';
import { RedisCacheProvider } from './providers/redis.provider';

@Global() // Deixa o provedor acessível em qualquer módulo (Payments, Auth, etc)
@Module({
  providers: [
    {
      provide: CACHE_PROVIDER,
      useClass: RedisCacheProvider,
    },
  ],
  exports: [CACHE_PROVIDER],
})
export class CacheModule {}
