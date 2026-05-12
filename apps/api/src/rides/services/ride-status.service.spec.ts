import type { Ride } from '../interfaces/rides-repository.interface';
import { RideStatusService } from './ride-status.service';
import { RideAccountingService } from './ride-accounting.service';

describe('RideStatusService', () => {
  let service: RideStatusService;
  let rideAccountingMock: jest.Mocked<
    Pick<RideAccountingService, 'resolvePaymentSnapshot'>
  >;

  const createRide = (overrides: Partial<Ride> = {}): Ride =>
    ({
      id: 'ride-1',
      clientId: 'client-1',
      value: 10,
      paidWithBalance: 0,
      paymentStatus: 'PENDING',
      status: 'PENDING',
      debtValue: 0,
      ...overrides,
    }) as Ride;

  beforeEach(() => {
    rideAccountingMock = {
      resolvePaymentSnapshot: jest.fn(
        ({
          value,
          paidWithBalance,
          paidExternally,
        }: {
          value: number;
          paidWithBalance: number;
          paidExternally?: number;
        }) => ({
          rideTotal: Number(value),
          paidWithBalance: Math.max(
            0,
            Math.min(
              Number(paidWithBalance ?? 0),
              Number(value) - Number(paidExternally ?? 0),
            ),
          ),
          paidExternally: Math.max(
            0,
            Math.min(Number(paidExternally ?? 0), Number(value)),
          ),
          paymentStatus:
            Number(value) -
              Number(paidExternally ?? 0) -
              Math.max(
                0,
                Math.min(
                  Number(paidWithBalance ?? 0),
                  Number(value) - Number(paidExternally ?? 0),
                ),
              ) >
            0
              ? 'PENDING'
              : 'PAID',
          debtValue: Math.max(
            0,
            Number(value) -
              Number(paidExternally ?? 0) -
              Math.max(
                0,
                Math.min(
                  Number(paidWithBalance ?? 0),
                  Number(value) - Number(paidExternally ?? 0),
                ),
              ),
          ),
        }),
      ),
    };

    service = new RideStatusService(rideAccountingMock);
  });

  it('should rebuild debt when restoring a cancelled ride', () => {
    const result = service.prepareStatusUpdate(
      createRide({
        value: 30,
        paidWithBalance: 5,
        paymentStatus: 'PENDING',
        status: 'CANCELLED',
      }),
      { status: 'COMPLETED' },
    );

    expect(result).toEqual({
      status: 'COMPLETED',
      debtValue: 25,
      paidExternally: 0,
    });
  });

  it('should calculate refund when ride value is reduced', () => {
    const result = service.prepareRideUpdate(
      createRide({
        value: 40,
        paidWithBalance: 10,
        debtValue: 30,
        paymentStatus: 'PENDING',
      }),
      { value: 6, paymentStatus: 'PENDING' },
    );

    expect(result.refundAmount).toBe(4);
    expect(result.updateData).toEqual(
      expect.objectContaining({
        value: 6,
        paidWithBalance: 6,
        paidExternally: 0,
        paymentStatus: 'PAID',
        debtValue: 0,
      }),
    );
  });

  it('should force pending when changing the client removes applied balance', () => {
    const result = service.prepareRideUpdate(
      createRide({
        value: 10,
        paidWithBalance: 10,
        paymentStatus: 'PAID',
      }),
      { clientId: 'client-2' },
    );

    expect(result.refundAmount).toBe(10);
    expect(result.updateData).toEqual(
      expect.objectContaining({
        clientId: 'client-2',
        value: 10,
        paidWithBalance: 0,
        paidExternally: 0,
        paymentStatus: 'PENDING',
        debtValue: 10,
      }),
    );
  });

  it('should force pending when increasing a paid ride leaves value open', () => {
    const result = service.prepareRideUpdate(
      createRide({
        value: 10,
        paidWithBalance: 10,
        paymentStatus: 'PAID',
      }),
      { value: 15, paymentStatus: 'PAID' },
    );

    expect(result.refundAmount).toBe(0);
    expect(result.updateData).toEqual(
      expect.objectContaining({
        value: 15,
        paidWithBalance: 10,
        paidExternally: 0,
        paymentStatus: 'PENDING',
        debtValue: 5,
      }),
    );
  });

  it('should preserve paid status when the previous external payment still covers the edited ride', () => {
    const result = service.prepareRideUpdate(
      createRide({
        value: 40,
        paidWithBalance: 10,
        debtValue: 0,
        paymentStatus: 'PAID',
      }),
      { value: 25 },
    );

    expect(result.refundAmount).toBe(10);
    expect(result.updateData).toEqual(
      expect.objectContaining({
        value: 25,
        paidWithBalance: 0,
        paidExternally: 25,
        paymentStatus: 'PAID',
        debtValue: 0,
      }),
    );
  });
});
