import { ClientPaymentReconciliationService } from './client-payment-reconciliation.service';

type RideFixture = {
  id: string;
  clientId: string;
  userId: string;
  value: number;
  paidWithBalance: number;
  paidExternally: number;
  paymentStatus: 'PENDING' | 'PAID';
  debtValue: number;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  rideDate: Date;
  createdAt: Date;
};

type PaymentFixture = {
  id: string;
  clientId: string;
  userId: string;
  amount: number;
  remainingAmount: number;
  status: 'UNUSED' | 'PARTIALLY_USED' | 'USED';
  paymentDate: Date;
  createdAt: Date;
};

const buildRide = (
  index: number,
  overrides: Partial<RideFixture> = {},
): RideFixture => ({
  id: `ride-${index}`,
  clientId: 'client-1',
  userId: 'user-1',
  value: 10,
  paidWithBalance: 0,
  paidExternally: 0,
  paymentStatus: 'PENDING',
  debtValue: 10,
  status: 'COMPLETED',
  rideDate: new Date(`2026-04-${String(index).padStart(2, '0')}T10:00:00.000Z`),
  createdAt: new Date(`2026-04-${String(index).padStart(2, '0')}T10:00:00.000Z`),
  ...overrides,
});

const buildPayment = (
  index: number,
  amount: number,
  overrides: Partial<PaymentFixture> = {},
): PaymentFixture => ({
  id: `payment-${index}`,
  clientId: 'client-1',
  userId: 'user-1',
  amount,
  remainingAmount: amount,
  status: 'UNUSED',
  paymentDate: new Date(`2026-04-${String(index).padStart(2, '0')}T12:00:00.000Z`),
  createdAt: new Date(`2026-04-${String(index).padStart(2, '0')}T12:00:00.000Z`),
  ...overrides,
});

describe('ClientPaymentReconciliationService', () => {
  function createService(fixtures: {
    rides: RideFixture[];
    payments: PaymentFixture[];
  }) {
    const clientsRepository = {
      findOneForUpdate: jest
        .fn()
        .mockResolvedValue({ id: 'client-1', userId: 'user-1', balance: 0 }),
      incrementBalance: jest.fn().mockResolvedValue({ id: 'client-1', balance: 0 }),
    };
    const ridesRepository = {
      findSettlementCandidatesByClient: jest
        .fn()
        .mockResolvedValue(fixtures.rides),
      updateFinancialSnapshot: jest.fn().mockImplementation(
        async (
          _userId: string,
          rideId: string,
          data: Partial<RideFixture>,
        ) => {
          const ride = fixtures.rides.find((entry) => entry.id === rideId);
          Object.assign(ride ?? {}, data);
          return ride;
        },
      ),
    };
    const clientPaymentsRepository = {
      findSettlementPaymentsByClient: jest
        .fn()
        .mockResolvedValue(fixtures.payments),
      updateFinancialState: jest.fn().mockImplementation(
        async (
          paymentId: string,
          _userId: string,
          data: Partial<PaymentFixture>,
        ) => {
          const payment = fixtures.payments.find((entry) => entry.id === paymentId);
          Object.assign(payment ?? {}, data);
          return payment;
        },
      ),
    };
    const balanceTransactionsRepository = {
      create: jest.fn().mockResolvedValue(undefined),
    };

    return {
      service: new ClientPaymentReconciliationService(
        clientsRepository as any,
        clientPaymentsRepository as any,
        ridesRepository as any,
        balanceTransactionsRepository as any,
      ),
      fixtures,
      clientsRepository,
      ridesRepository,
      clientPaymentsRepository,
      balanceTransactionsRepository,
    };
  }

  it('should settle rides in FIFO order for an exact partial payment', async () => {
    const fixtures = {
      rides: Array.from({ length: 10 }, (_, index) => buildRide(index + 1)),
      payments: [buildPayment(1, 50)],
    };
    const { service } = createService(fixtures);

    const result = await service.reconcileClientPayments('user-1', 'client-1');

    expect(result).toEqual({
      settledRides: 5,
      generatedBalance: 0,
      unappliedAmount: 0,
      nextRideAmount: 10,
      nextRideShortfall: 10,
      hasPartialPaymentCarryover: false,
    });
    expect(fixtures.rides.slice(0, 5)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ paymentStatus: 'PAID', debtValue: 0 }),
      ]),
    );
    expect(fixtures.rides.slice(5)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ paymentStatus: 'PENDING', debtValue: 10 }),
      ]),
    );
    expect(fixtures.payments[0]).toEqual(
      expect.objectContaining({
        status: 'USED',
        remainingAmount: 0,
      }),
    );
  });

  it('should keep the remainder available when the next ride is not fully covered', async () => {
    const fixtures = {
      rides: [buildRide(1, { value: 30, debtValue: 30 }), buildRide(2, { value: 30, debtValue: 30 })],
      payments: [buildPayment(1, 20), buildPayment(2, 20)],
    };
    const { service } = createService(fixtures);

    const result = await service.reconcileClientPayments('user-1', 'client-1');

    expect(result).toEqual({
      settledRides: 1,
      generatedBalance: 0,
      unappliedAmount: 10,
      nextRideAmount: 30,
      nextRideShortfall: 20,
      hasPartialPaymentCarryover: true,
    });
    expect(fixtures.rides[0]).toEqual(
      expect.objectContaining({ paymentStatus: 'PAID', debtValue: 0 }),
    );
    expect(fixtures.rides[1]).toEqual(
      expect.objectContaining({ paymentStatus: 'PENDING', debtValue: 30 }),
    );
    expect(fixtures.payments[0]).toEqual(
      expect.objectContaining({ status: 'USED', remainingAmount: 0 }),
    );
    expect(fixtures.payments[1]).toEqual(
      expect.objectContaining({
        status: 'PARTIALLY_USED',
        remainingAmount: 10,
      }),
    );
  });

  it('should convert overflow into client balance after all rides are settled', async () => {
    const fixtures = {
      rides: [buildRide(1, { value: 20, debtValue: 20 })],
      payments: [buildPayment(1, 35)],
    };
    const {
      service,
      clientsRepository,
      balanceTransactionsRepository,
    } = createService(fixtures);

    const result = await service.reconcileClientPayments('user-1', 'client-1');

    expect(result).toEqual({
      settledRides: 1,
      generatedBalance: 15,
      unappliedAmount: 0,
      nextRideAmount: null,
      nextRideShortfall: null,
      hasPartialPaymentCarryover: false,
    });
    expect(clientsRepository.incrementBalance).toHaveBeenCalledWith(
      'user-1',
      'client-1',
      15,
      undefined,
    );
    expect(balanceTransactionsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: 'client-1',
        userId: 'user-1',
        amount: 15,
        type: 'CREDIT',
        origin: 'PAYMENT_OVERFLOW',
      }),
      undefined,
    );
    expect(fixtures.payments[0]).toEqual(
      expect.objectContaining({ status: 'USED', remainingAmount: 0 }),
    );
  });

  it('should summarize carryover when the next ride is not fully covered', async () => {
    const fixtures = {
      rides: [
        buildRide(1, { value: 30, debtValue: 30 }),
        buildRide(2, { value: 30, debtValue: 30 }),
      ],
      payments: [buildPayment(1, 20), buildPayment(2, 20)],
    };
    const { service } = createService(fixtures);

    const result = await service.getClientPaymentSummary('user-1', 'client-1');

    expect(result).toEqual({
      unappliedAmount: 10,
      nextRideAmount: 30,
      nextRideShortfall: 20,
      hasPartialPaymentCarryover: true,
    });
  });
});
