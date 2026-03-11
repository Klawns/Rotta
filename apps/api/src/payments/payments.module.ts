import { Module, Global, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { UsersModule } from '../users/users.module';
import { CacheModule } from '../cache/cache.module';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PAYMENT_PROVIDER } from './providers/payment-provider.interface';
import { AbacatePayProvider } from './providers/abacatepay.provider';
import { WebhookWorker } from './queue/webhook.worker';
import { DrizzlePaymentsRepository } from './repositories/drizzle-payments.repository';
import { IPaymentsRepository } from './interfaces/payments-repository.interface';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'webhooks',
    }),
    forwardRef(() => SubscriptionsModule),
    forwardRef(() => UsersModule),
    CacheModule,
  ],
  providers: [
    PaymentsService,
    AbacatePayProvider,
    WebhookWorker,
    {
      provide: PAYMENT_PROVIDER,
      useClass: AbacatePayProvider,
    },
    {
      provide: IPaymentsRepository,
      useClass: DrizzlePaymentsRepository,
    },
  ],
  controllers: [PaymentsController],
  exports: [PaymentsService, PAYMENT_PROVIDER, IPaymentsRepository],
})
export class PaymentsModule {}
