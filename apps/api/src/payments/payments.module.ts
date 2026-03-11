import { Module, Global } from '@nestjs/common';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { UsersModule } from '../users/users.module';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PAYMENT_PROVIDER } from './providers/payment-provider.interface';
import { AbacatePayProvider } from './providers/abacatepay.provider';

@Module({
  imports: [SubscriptionsModule, UsersModule],
  providers: [
    PaymentsService,
    AbacatePayProvider,
    {
      provide: PAYMENT_PROVIDER,
      useClass: AbacatePayProvider,
    }
  ],
  controllers: [PaymentsController],
  exports: [PaymentsService, PAYMENT_PROVIDER],
})
export class PaymentsModule { }
