import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CacheModule } from './cache/cache.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { RidesModule } from './rides/rides.module';
import { PaymentsModule } from './payments/payments.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AdminModule } from './admin/admin.module';
import { SettingsModule } from './settings/settings.module';
import { DebugController } from './debug/debug.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/api/.env'],
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL');
        return {
          throttlers: [{
            ttl: 60000,
            limit: 100, // Limite global generoso inicial: 100 req por min / ip
          }],
          // Se REDIS_URL existir usa o redis distribuído. Se não (local dev) cai na memoria
          storage: redisUrl ? new ThrottlerStorageRedisService(redisUrl) : undefined,
        };
      }
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        if (redisUrl) {
          return {
            connection: { url: redisUrl }
          };
        }
        return {
          connection: { host: 'localhost', port: 6379 }
        }
      },
    }),
    DatabaseModule,
    CacheModule,
    UsersModule,
    AuthModule,
    ClientsModule,
    RidesModule,
    PaymentsModule,
    SubscriptionsModule,
    AdminModule,
    SettingsModule,
  ],
  controllers: [AppController, DebugController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Ativa a proteção em todas as rotas
    }
  ],
})
export class AppModule { }
