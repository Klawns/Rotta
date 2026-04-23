import { Injectable } from '@nestjs/common';
import type { UpdateRideDto, UpdateRideStatusDto } from '../dto/rides.dto';
import type { Ride } from '../interfaces/rides-repository.interface';
import { RideAccountingService } from './ride-accounting.service';

@Injectable()
export class RideStatusService {
  constructor(private readonly rideAccountingService: RideAccountingService) {}

  prepareRideUpdate(existingRide: Ride, data: UpdateRideDto) {
    const { rideDate, ...restData } = data;
    const updateData: Omit<UpdateRideDto, 'rideDate'> & {
      rideDate?: Date | null;
      paidWithBalance?: number;
      paidExternally?: number;
      debtValue?: number;
    } = { ...restData };
    const financialInputsChanged =
      data.value !== undefined ||
      data.paymentStatus !== undefined ||
      data.clientId !== undefined;
    const paymentInputsChanged =
      data.value !== undefined ||
      data.clientId !== undefined ||
      data.paymentStatus !== undefined;
    const previousRideValue = Number(existingRide.value);
    const nextClientId = data.clientId ?? existingRide.clientId;
    const nextRideValue = Number(data.value ?? Number(existingRide.value));
    const previousPaidWithBalance = Number(existingRide.paidWithBalance ?? 0);
    const previousDebtValue = Number(existingRide.debtValue ?? 0);
    const previousPaidExternally = Math.max(
      0,
      Number(
        existingRide.paidExternally ??
          (previousRideValue - previousPaidWithBalance - previousDebtValue),
      ),
    );
    const maxRetainedBalance = Math.max(0, nextRideValue - previousPaidExternally);
    const nextPaidWithBalance =
      nextClientId === existingRide.clientId
        ? Math.min(previousPaidWithBalance, maxRetainedBalance)
        : 0;

    if (rideDate !== undefined) {
      updateData.rideDate = !rideDate ? null : new Date(rideDate);
    }

    if (financialInputsChanged) {
      const {
        rideTotal,
        paidWithBalance,
        paidExternally,
        debtValue,
        paymentStatus,
      } =
        this.rideAccountingService.resolvePaymentSnapshot({
          value: nextRideValue,
          paidWithBalance: nextPaidWithBalance,
          paidExternally:
            paymentInputsChanged && data.paymentStatus === undefined
              ? previousPaidExternally
              : undefined,
          paymentStatus: data.paymentStatus ?? existingRide.paymentStatus,
        });

      updateData.value = rideTotal;
      updateData.paidWithBalance = paidWithBalance;
      updateData.paidExternally = paidExternally;
      updateData.debtValue = debtValue;
      updateData.paymentStatus = paymentStatus;
    }

    const refundAmount =
      nextClientId === existingRide.clientId
        ? Math.max(0, previousPaidWithBalance - nextPaidWithBalance)
        : previousPaidWithBalance;

    return {
      nextClientId,
      refundAmount,
      updateData,
    };
  }

  prepareStatusUpdate(existingRide: Ride, data: UpdateRideStatusDto) {
    const updateData: UpdateRideStatusDto & {
      debtValue?: number;
      paidExternally?: number;
    } = {
      ...data,
    };

    if (data.status === 'CANCELLED') {
      updateData.debtValue = 0;
      return updateData;
    }

    if (data.paymentStatus !== undefined) {
      const { debtValue, paidExternally, paymentStatus } =
        this.rideAccountingService.resolvePaymentSnapshot({
          value: Number(existingRide.value),
          paidWithBalance: Number(existingRide.paidWithBalance ?? 0),
          paymentStatus: data.paymentStatus,
        });

      updateData.paymentStatus = paymentStatus;
      updateData.paidExternally = paidExternally;
      updateData.debtValue = debtValue;
      return updateData;
    }

    if (existingRide.status === 'CANCELLED' && data.status !== undefined) {
      const { debtValue, paidExternally } =
        this.rideAccountingService.resolvePaymentSnapshot({
          value: Number(existingRide.value),
          paidWithBalance: Number(existingRide.paidWithBalance ?? 0),
          paidExternally: Number(existingRide.paidExternally ?? 0),
          paymentStatus: existingRide.paymentStatus,
        });

      updateData.debtValue = debtValue;
      updateData.paidExternally = paidExternally;
    }

    return updateData;
  }
}
