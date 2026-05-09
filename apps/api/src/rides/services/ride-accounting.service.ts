import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IClientsRepository } from '../../clients/interfaces/clients-repository.interface';
import { IBalanceTransactionsRepository } from '../../clients/interfaces/balance-transactions-repository.interface';
import {
  CLIENT_NOT_FOUND_MESSAGE,
  RIDE_RESTORE_INSUFFICIENT_BALANCE_MESSAGE,
} from '../../common/messages/domain-errors';

interface ResolvePaymentSnapshotInput {
  value: number;
  paidWithBalance: number;
  paymentStatus?: 'PENDING' | 'PAID';
  paidExternally?: number;
}

@Injectable()
export class RideAccountingService {
  constructor(
    @Inject(IClientsRepository)
    private readonly clientsRepository: IClientsRepository,
    @Inject(IBalanceTransactionsRepository)
    private readonly balanceTransactionsRepository: IBalanceTransactionsRepository,
  ) {}

  resolvePaymentSnapshot({
    value,
    paidWithBalance,
    paymentStatus,
    paidExternally,
  }: ResolvePaymentSnapshotInput) {
    const rideTotal = Number(value);
    const normalizedPaidExternally = Math.max(
      0,
      Math.min(
        Number(
          paidExternally ??
            (paymentStatus === 'PAID'
              ? rideTotal - Number(paidWithBalance || 0)
              : 0),
        ),
        rideTotal,
      ),
    );
    const normalizedPaidWithBalance = Math.max(
      0,
      Math.min(
        Number(paidWithBalance || 0),
        rideTotal - normalizedPaidExternally,
      ),
    );
    const remainingAfterBalance = Math.max(
      0,
      rideTotal - normalizedPaidExternally - normalizedPaidWithBalance,
    );
    const normalizedPaymentStatus: 'PENDING' | 'PAID' =
      remainingAfterBalance > 0 ? 'PENDING' : 'PAID';
    const debtValue =
      normalizedPaymentStatus === 'PENDING' ? remainingAfterBalance : 0;

    return {
      rideTotal,
      paidWithBalance: normalizedPaidWithBalance,
      paidExternally: normalizedPaidExternally,
      paymentStatus: normalizedPaymentStatus,
      debtValue,
    };
  }

  async getClientOrThrow(userId: string, clientId: string, executor?: unknown) {
    return this.getScopedClientOrThrow(userId, clientId, executor);
  }

  private async getScopedClientOrThrow(
    userId: string,
    clientId: string,
    executor?: unknown,
    options?: { forUpdate?: boolean },
  ) {
    const client = options?.forUpdate
      ? await this.clientsRepository.findOneForUpdate(
          userId,
          clientId,
          executor,
        )
      : await this.clientsRepository.findOne(userId, clientId, executor);

    if (!client) {
      throw new NotFoundException(CLIENT_NOT_FOUND_MESSAGE);
    }

    return client;
  }

  async consumeClientBalance(
    userId: string,
    clientId: string,
    rideValue: number,
    executor: unknown,
  ) {
    const client = await this.getScopedClientOrThrow(
      userId,
      clientId,
      executor,
      {
        forUpdate: true,
      },
    );
    const currentBalance = Number(client.balance || 0);
    const amountToUse = Math.min(currentBalance, Number(rideValue));

    if (amountToUse <= 0) {
      return 0;
    }

    const updatedClient = await this.clientsRepository.decrementBalance(
      userId,
      clientId,
      amountToUse,
      executor,
    );

    if (!updatedClient) {
      throw new NotFoundException(CLIENT_NOT_FOUND_MESSAGE);
    }

    await this.balanceTransactionsRepository.create(
      {
        id: randomUUID(),
        clientId,
        userId,
        amount: amountToUse,
        type: 'DEBIT',
        origin: 'RIDE_USAGE',
        description: 'Uso de saldo para a corrida.',
      },
      executor,
    );

    return amountToUse;
  }

  async consumeExactClientBalanceOrThrow(
    userId: string,
    clientId: string,
    amount: number,
    executor: unknown,
  ) {
    if (amount <= 0) {
      return;
    }

    const client = await this.getScopedClientOrThrow(
      userId,
      clientId,
      executor,
      {
        forUpdate: true,
      },
    );
    const normalizedAmount = Number(amount);
    const currentBalance = Number(client.balance || 0);

    if (currentBalance < normalizedAmount) {
      throw new ConflictException(RIDE_RESTORE_INSUFFICIENT_BALANCE_MESSAGE);
    }

    const updatedClient = await this.clientsRepository.decrementBalance(
      userId,
      clientId,
      normalizedAmount,
      executor,
    );

    if (!updatedClient) {
      throw new NotFoundException(CLIENT_NOT_FOUND_MESSAGE);
    }

    await this.balanceTransactionsRepository.create(
      {
        id: randomUUID(),
        clientId,
        userId,
        amount: normalizedAmount,
        type: 'DEBIT',
        origin: 'RIDE_RESTORE_USAGE',
        description: 'Uso de saldo para restaurar a corrida.',
      },
      executor,
    );
  }

  async refundClientBalance(
    userId: string,
    clientId: string,
    amount: number,
    rideId: string,
    executor: unknown,
  ) {
    if (amount <= 0) {
      return;
    }

    const updatedClient = await this.clientsRepository.incrementBalance(
      userId,
      clientId,
      amount,
      executor,
    );

    if (!updatedClient) {
      throw new NotFoundException(CLIENT_NOT_FOUND_MESSAGE);
    }

    await this.balanceTransactionsRepository.create(
      {
        id: randomUUID(),
        clientId,
        userId,
        amount,
        type: 'CREDIT',
        origin: 'RIDE_ARCHIVE_REFUND',
        description: `Reversão de saldo vinculada à corrida ${rideId}.`,
      },
      executor,
    );
  }
}
