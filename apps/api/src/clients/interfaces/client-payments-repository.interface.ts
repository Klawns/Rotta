import { clientPayments } from '@mdc/database';

export type ClientPayment = typeof clientPayments.$inferSelect;
export type CreateClientPaymentDto = typeof clientPayments.$inferInsert;

export const IClientPaymentsRepository = Symbol('IClientPaymentsRepository');

export interface IClientPaymentsRepository {
  findByClient(
    clientId: string,
    userId: string,
    status?: 'UNUSED' | 'PARTIALLY_USED' | 'USED',
  ): Promise<ClientPayment[]>;

  create(
    data: CreateClientPaymentDto,
    executor?: unknown,
  ): Promise<ClientPayment>;

  findOne(
    paymentId: string,
    userId: string,
    executor?: unknown,
  ): Promise<ClientPayment | undefined>;

  findByIdempotencyKey(
    clientId: string,
    userId: string,
    idempotencyKey: string,
    executor?: unknown,
  ): Promise<ClientPayment | undefined>;

  markAsUsed(
    clientId: string,
    userId: string,
    executor?: unknown,
  ): Promise<void>;

  findSettlementPaymentsByClient(
    clientId: string,
    userId: string,
    executor?: unknown,
  ): Promise<ClientPayment[]>;

  updateFinancialState(
    paymentId: string,
    userId: string,
    data: Pick<ClientPayment, 'remainingAmount' | 'status'>,
    executor?: unknown,
  ): Promise<ClientPayment>;

  getUnusedPaymentsStats(
    clientId: string,
    userId: string,
    executor?: unknown,
  ): Promise<{ totalPaid: number; unusedPaymentsCount: number }>;
}
