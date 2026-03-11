import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { DrizzleSubscriptionsRepository } from './repositories/drizzle-subscriptions.repository';
import { ISubscriptionsRepository } from './interfaces/subscriptions-repository.interface';

@Module({
  providers: [
    SubscriptionsService,
    {
      provide: ISubscriptionsRepository,
      useClass: DrizzleSubscriptionsRepository,
    },
  ],
  controllers: [SubscriptionsController],
  exports: [SubscriptionsService, ISubscriptionsRepository],
})
export class SubscriptionsModule {}
