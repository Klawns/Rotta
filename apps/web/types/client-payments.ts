export type ClientPaymentStatus = 'UNUSED' | 'PARTIALLY_USED' | 'USED';

export interface ClientPayment {
  id: string;
  clientId: string;
  userId?: string;
  amount: number;
  remainingAmount: number;
  paymentDate: string;
  status: ClientPaymentStatus;
  idempotencyKey?: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateClientPaymentInput {
  amount: number;
  notes?: string;
  idempotencyKey: string;
}
