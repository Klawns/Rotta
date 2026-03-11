import { Module } from '@nestjs/common';
import { RidesService } from './rides.service';
import { RidesController } from './rides.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { DrizzleRidesRepository } from './repositories/drizzle-rides.repository';
import { IRidesRepository } from './interfaces/rides-repository.interface';

@Module({
  imports: [SubscriptionsModule],
  providers: [
    RidesService,
    {
      provide: IRidesRepository,
      useClass: DrizzleRidesRepository,
    },
  ],
  controllers: [RidesController],
  exports: [RidesService, IRidesRepository],
})
export class RidesModule {}
