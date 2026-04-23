import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IClientsRepository } from '../interfaces/clients-repository.interface';
import { IClientPaymentsRepository } from '../interfaces/client-payments-repository.interface';
import { IRidesRepository } from '../../rides/interfaces/rides-repository.interface';
import { IBalanceTransactionsRepository } from '../interfaces/balance-transactions-repository.interface';
import type { ClientPayment } from '../interfaces/client-payments-repository.interface';
import type { Ride } from '../../rides/interfaces/rides-repository.interface';

type PaymentUsageStatus = 'UNUSED' | 'PARTIALLY_USED' | 'USED';

type MutablePayment = ClientPayment & {
  availableAmount: number;
  nextRemainingAmount: number;
  nextStatus: PaymentUsageStatus;
};

interface ClientPaymentSummary {
  unappliedAmount: number;
  nextRideAmount: number | null;
  nextRideShortfall: number | null;
  hasPartialPaymentCarryover: boolean;
}

@Injectable()
export class ClientPaymentReconciliationService {
  constructor(
    @Inject(IClientsRepository)
    private readonly clientsRepository: IClientsRepository,
    @Inject(IClientPaymentsRepository)
    private readonly clientPaymentsRepository: IClientPaymentsRepository,
    @Inject(IRidesRepository)
    private readonly ridesRepository: IRidesRepository,
    @Inject(IBalanceTransactionsRepository)
    private readonly balanceTransactionsRepository: IBalanceTransactionsRepository,
  ) {}

  private resolveRideDebt(ride: Ride) {
    return Math.max(
      0,
      Number(ride.value) -
        Number(ride.paidWithBalance ?? 0) -
        Number(ride.paidExternally ?? 0),
    );
  }

  private resolvePaymentAvailableAmount(payment: ClientPayment) {
    if (payment.status === 'USED') {
      return 0;
    }

    const remainingAmount = Number(payment.remainingAmount ?? 0);

    if (remainingAmount > 0) {
      return remainingAmount;
    }

    return Number(payment.amount ?? 0);
  }

  private resolvePaymentStatus(amount: number, remainingAmount: number): PaymentUsageStatus {
    if (remainingAmount <= 0) {
      return 'USED';
    }

    if (remainingAmount >= amount) {
      return 'UNUSED';
    }

    return 'PARTIALLY_USED';
  }

  private consumePayments(payments: MutablePayment[], amountToConsume: number) {
    let remainingToConsume = amountToConsume;

    for (const payment of payments) {
      if (remainingToConsume <= 0) {
        break;
      }

      if (payment.nextRemainingAmount <= 0) {
        continue;
      }

      const consumedAmount = Math.min(payment.nextRemainingAmount, remainingToConsume);
      payment.nextRemainingAmount -= consumedAmount;
      remainingToConsume -= consumedAmount;
    }
  }

  private buildMutablePayments(payments: ClientPayment[]) {
    return payments.map((payment) => {
      const availableAmount = this.resolvePaymentAvailableAmount(payment);

      return {
        ...payment,
        availableAmount,
        nextRemainingAmount: availableAmount,
        nextStatus: payment.status as PaymentUsageStatus,
      };
    });
  }

  private summarizePendingPaymentState(
    rides: Ride[],
    payments: ClientPayment[],
  ): ClientPaymentSummary {
    const mutablePayments = this.buildMutablePayments(payments);
    let availableAmount = mutablePayments.reduce(
      (total, payment) => total + payment.nextRemainingAmount,
      0,
    );

    for (const ride of rides) {
      const debtValue = this.resolveRideDebt(ride);

      if (debtValue <= 0) {
        continue;
      }

      if (availableAmount >= debtValue) {
        this.consumePayments(mutablePayments, debtValue);
        availableAmount -= debtValue;
        continue;
      }

      return {
        unappliedAmount: availableAmount,
        nextRideAmount: debtValue,
        nextRideShortfall: Math.max(0, debtValue - availableAmount),
        hasPartialPaymentCarryover: availableAmount > 0,
      };
    }

    return {
      unappliedAmount: 0,
      nextRideAmount: null,
      nextRideShortfall: null,
      hasPartialPaymentCarryover: false,
    };
  }

  async getClientPaymentSummary(
    userId: string,
    clientId: string,
    executor?: unknown,
  ): Promise<ClientPaymentSummary> {
    const [rides, payments] = await Promise.all([
      this.ridesRepository.findSettlementCandidatesByClient(
        clientId,
        userId,
        executor,
      ),
      this.clientPaymentsRepository.findSettlementPaymentsByClient(
        clientId,
        userId,
        executor,
      ),
    ]);

    return this.summarizePendingPaymentState(rides, payments);
  }

  async reconcileClientPayments(
    userId: string,
    clientId: string,
    executor?: unknown,
  ) {
    const client = await this.clientsRepository.findOneForUpdate(
      userId,
      clientId,
      executor,
    );

    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    const [rides, payments] = await Promise.all([
      this.ridesRepository.findSettlementCandidatesByClient(
        clientId,
        userId,
        executor,
      ),
      this.clientPaymentsRepository.findSettlementPaymentsByClient(
        clientId,
        userId,
        executor,
      ),
    ]);

    const mutablePayments = this.buildMutablePayments(payments);

    let availableAmount = mutablePayments.reduce(
      (total, payment) => total + payment.nextRemainingAmount,
      0,
    );
    let settledRides = 0;
    let hasPendingRide = false;
    let nextRideAmount: number | null = null;
    let nextRideShortfall: number | null = null;

    for (const ride of rides) {
      const debtValue = this.resolveRideDebt(ride);

      if (debtValue <= 0) {
        if (ride.paymentStatus !== 'PAID' || Number(ride.debtValue ?? 0) !== 0) {
          await this.ridesRepository.updateFinancialSnapshot(
            userId,
            ride.id,
            {
              paymentStatus: 'PAID',
              debtValue: 0,
            },
            executor,
          );
        }

        continue;
      }

      if (availableAmount >= debtValue) {
        if (ride.paymentStatus !== 'PAID' || Number(ride.debtValue ?? 0) !== 0) {
          settledRides += 1;
          await this.ridesRepository.updateFinancialSnapshot(
            userId,
            ride.id,
            {
              paymentStatus: 'PAID',
              debtValue: 0,
            },
            executor,
          );
        }

        this.consumePayments(mutablePayments, debtValue);
        availableAmount -= debtValue;
        continue;
      }

      hasPendingRide = true;
      if (nextRideAmount === null) {
        nextRideAmount = debtValue;
        nextRideShortfall = Math.max(0, debtValue - availableAmount);
      }

      if (
        ride.paymentStatus !== 'PENDING' ||
        Number(ride.debtValue ?? 0) !== Number(debtValue)
      ) {
        await this.ridesRepository.updateFinancialSnapshot(
          userId,
          ride.id,
          {
            paymentStatus: 'PENDING',
            debtValue,
          },
          executor,
        );
      }
    }

    for (const payment of mutablePayments) {
      payment.nextStatus = this.resolvePaymentStatus(
        Number(payment.amount ?? 0),
        payment.nextRemainingAmount,
      );
    }

    let generatedBalance = 0;

    if (!hasPendingRide && availableAmount > 0) {
      generatedBalance = availableAmount;
      availableAmount = 0;

      const updatedClient = await this.clientsRepository.incrementBalance(
        userId,
        clientId,
        generatedBalance,
        executor,
      );

      if (!updatedClient) {
        throw new NotFoundException('Cliente não encontrado.');
      }

      await this.balanceTransactionsRepository.create(
        {
          id: randomUUID(),
          clientId,
          userId,
          amount: generatedBalance,
          type: 'CREDIT',
          origin: 'PAYMENT_OVERFLOW',
          description: 'Crédito gerado por pagamento excedente ao quitar dívida.',
        },
        executor,
      );

      for (const payment of mutablePayments) {
        payment.nextRemainingAmount = 0;
        payment.nextStatus = 'USED';
      }
    }

    for (const payment of mutablePayments) {
      const currentRemainingAmount = Number(payment.remainingAmount ?? 0);
      const currentStatus = payment.status as PaymentUsageStatus;

      if (
        currentRemainingAmount === payment.nextRemainingAmount &&
        currentStatus === payment.nextStatus
      ) {
        continue;
      }

      await this.clientPaymentsRepository.updateFinancialState(
        payment.id,
        userId,
        {
          remainingAmount: payment.nextRemainingAmount,
          status: payment.nextStatus,
        },
        executor,
      );
    }

    return {
      settledRides,
      generatedBalance,
      unappliedAmount: availableAmount,
      nextRideAmount,
      nextRideShortfall,
      hasPartialPaymentCarryover:
        availableAmount > 0 && nextRideShortfall !== null,
    };
  }
}
