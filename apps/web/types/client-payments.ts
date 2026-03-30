export type ClientPaymentStatus = 'UNUSED' | 'USED';

export interface ClientPayment {
  id: string;
  clientId: string;
  userId?: string;
  amount: number;
  paymentDate: string;
  status: ClientPaymentStatus;
  notes: string | null;
  createdAt: string;
}

export interface CreateClientPaymentInput {
  amount: number;
  notes?: string;
}
