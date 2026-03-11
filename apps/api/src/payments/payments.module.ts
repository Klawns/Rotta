import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { UsersModule } from '../users/users.module';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PAYMENT_PROVIDER } from './providers/payment-provider.interface';
import { AbacatePayProvider } from './providers/abacatepay.provider';
import { WebhookWorker } from './queue/webhook.worker';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'webhooks',
    }),
    SubscriptionsModule,
    UsersModule
  ],
  providers: [
    PaymentsService,
    AbacatePayProvider,
    WebhookWorker,
    {
      provide: PAYMENT_PROVIDER,
      useClass: AbacatePayProvider,
    }
  ],
  controllers: [PaymentsController],
  exports: [PaymentsService, PAYMENT_PROVIDER],
})
export class PaymentsModule { }
