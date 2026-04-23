import { Module, forwardRef } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { DrizzleClientsRepository } from './repositories/drizzle-clients.repository';
import { IClientsRepository } from './interfaces/clients-repository.interface';
import { DrizzleClientPaymentsRepository } from './repositories/drizzle-client-payments.repository';
import { IClientPaymentsRepository } from './interfaces/client-payments-repository.interface';
import { DrizzleBalanceTransactionsRepository } from './repositories/drizzle-balance-transactions.repository';
import { IBalanceTransactionsRepository } from './interfaces/balance-transactions-repository.interface';
import { RidesModule } from '../rides/rides.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { ClientPaymentReconciliationService } from './services/client-payment-reconciliation.service';

@Module({
  providers: [
    ClientsService,
    ClientPaymentReconciliationService,
    {
      provide: IClientsRepository,
      useClass: DrizzleClientsRepository,
    },
    {
      provide: IClientPaymentsRepository,
      useClass: DrizzleClientPaymentsRepository,
    },
    {
      provide: IBalanceTransactionsRepository,
      useClass: DrizzleBalanceTransactionsRepository,
    },
  ],
  imports: [forwardRef(() => RidesModule), SubscriptionsModule],
  controllers: [ClientsController],
  exports: [
    ClientsService,
    ClientPaymentReconciliationService,
    IClientsRepository,
    IClientPaymentsRepository,
    IBalanceTransactionsRepository,
  ],
})
export class ClientsModule {}
