import { Module, forwardRef } from '@nestjs/common';
import { RidesService } from './rides.service';
import { RidesController } from './rides.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { CacheModule } from '../cache/cache.module';
import { DrizzleRidesRepository } from './repositories/drizzle-rides.repository';
import { IRidesRepository } from './interfaces/rides-repository.interface';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [
    SubscriptionsModule,
    CacheModule,
    forwardRef(() => ClientsModule),
  ],
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
