/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument -- Ride service aggregates runtime-shaped repository results and normalized DTO payloads. */
import {
  Injectable,
  Inject,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { and, eq, isNull } from 'drizzle-orm';
import { ProfileCacheService } from '../cache/profile-cache.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { IRidesRepository } from './interfaces/rides-repository.interface';
import {
  endOfSaoPauloCalendarDay,
  getDatesFromPeriod,
  startOfSaoPauloCalendarDay,
} from '../common/utils/date.util';
import { RideMapper } from './mappers/ride.mapper';
import { DRIZZLE } from '../database/database.provider';
import type { DrizzleClient } from '../database/database.provider';
import { UserDashboardCacheService } from '../cache/user-dashboard-cache.service';
import { RideAccountingService } from './services/ride-accounting.service';
import { RideLifecycleEventService } from './services/ride-lifecycle-event.service';
import { RidePhotoReferenceService } from './services/ride-photo-reference.service';
import { RideStatusService } from './services/ride-status.service';
import type {
  BulkDeleteRidesDto,
  CreateRideDto,
  RestoreBulkRidesDto,
  UpdateRideDto,
  UpdateRideStatusDto,
  GetStatsDto,
} from './dto/rides.dto';
import type { RideResponseDto } from './dto/ride-response.dto';
import type {
  ArchiveRideInput,
  Ride,
  RideWithClient,
} from './interfaces/rides-repository.interface';
import { ClientPaymentReconciliationService } from '../clients/services/client-payment-reconciliation.service';
import { IClientPaymentsRepository } from '../clients/interfaces/client-payments-repository.interface';
import {
  PLAN_NOT_FOUND_MESSAGE,
  RIDE_NOT_FOUND_MESSAGE,
} from '../common/messages/domain-errors';

type TransactionRunner = {
  transaction<T>(callback: (tx: unknown) => Promise<T>): Promise<T>;
};

type RideBalanceRow = {
  id: string;
  clientId: string;
  paidWithBalance: number | null;
};

interface BulkDeleteTransaction {
  select(selection: {
    id: unknown;
    clientId: unknown;
    paidWithBalance: unknown;
  }): {
    from(table: unknown): {
      where(condition: unknown): Promise<RideBalanceRow[]>;
    };
  };
}

interface RideStatsResult {
  count: number;
  totalValue: number;
  rides: RideResponseDto[];
}

interface RideCreateTimings {
  photoValidationMs: number;
  subscriptionMs: number;
  transactionMs: number;
  clientLookupMs: number;
  paymentSnapshotMs: number;
  insertMs: number;
  lifecycleMs: number;
  reconciliationGateMs: number;
  reconciliationMs: number;
  finalReadMs: number;
  invalidateMs: number;
}

type RideArchiveReason = 'user-delete' | 'bulk-delete';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'erro desconhecido';
}

function parseRideDateFilters<
  TFilters extends { startDate?: string; endDate?: string },
>(filters?: TFilters) {
  return {
    ...filters,
    startDate: filters?.startDate
      ? startOfSaoPauloCalendarDay(filters.startDate)
      : undefined,
    endDate: filters?.endDate
      ? endOfSaoPauloCalendarDay(filters.endDate)
      : undefined,
  };
}

@Injectable()
export class RidesService {
  private readonly logger = new Logger(RidesService.name);

  constructor(
    @Inject(IRidesRepository)
    private readonly ridesRepository: IRidesRepository,
    private readonly subscriptionsService: SubscriptionsService,
    @Inject(DRIZZLE) private readonly drizzle: DrizzleClient,
    private readonly profileCacheService: ProfileCacheService,
    private readonly userDashboardCacheService: UserDashboardCacheService,
    private readonly rideAccountingService: RideAccountingService,
    private readonly rideLifecycleEventService: RideLifecycleEventService,
    private readonly ridePhotoReferenceService: RidePhotoReferenceService,
    private readonly rideStatusService: RideStatusService,
    private readonly clientPaymentReconciliationService: ClientPaymentReconciliationService,
    @Inject(IClientPaymentsRepository)
    private readonly clientPaymentsRepository: IClientPaymentsRepository,
  ) {}

  private async getRideOrThrow(
    userId: string,
    id: string,
    executor?: unknown,
  ): Promise<Ride> {
    const ride = await this.ridesRepository.findOne(userId, id, executor);

    if (!ride) {
      throw new NotFoundException(RIDE_NOT_FOUND_MESSAGE);
    }

    return ride;
  }

  private async getRideWithClientOrThrow(
    userId: string,
    id: string,
    executor?: unknown,
  ): Promise<RideWithClient> {
    const ride = await this.ridesRepository.findOneWithClient(
      userId,
      id,
      executor,
    );
    if (!ride) {
      throw new NotFoundException(RIDE_NOT_FOUND_MESSAGE);
    }

    return ride;
  }

  private async getArchivedRideOrThrow(
    userId: string,
    id: string,
    executor?: unknown,
  ): Promise<Ride> {
    const ride = await this.ridesRepository.findArchivedOne(
      userId,
      id,
      executor,
    );

    if (!ride) {
      throw new NotFoundException(RIDE_NOT_FOUND_MESSAGE);
    }

    return ride;
  }

  private async invalidateRideMutations(userId: string) {
    const invalidations = [
      {
        cacheName: 'user dashboard',
        execute: () => this.userDashboardCacheService.invalidate(userId),
      },
      {
        cacheName: 'profile',
        execute: () => this.profileCacheService.invalidate(userId),
      },
    ];

    const results = await Promise.allSettled(
      invalidations.map(({ execute }) => execute()),
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        return;
      }

      const { cacheName } = invalidations[index];
      const error = result.reason;

      this.logger.error(
        `[RidesService] Falha ao invalidar cache ${cacheName} apos mutacao da corrida para o usuario ${userId}: ${getErrorMessage(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    });
  }

  private async cleanupManagedRidePhoto(
    photo: string | null | undefined,
    context: { action: 'update' | 'delete' | 'delete-all'; userId: string },
  ) {
    if (!this.ridePhotoReferenceService.isManagedPhotoKey(photo)) {
      return;
    }

    try {
      await this.ridePhotoReferenceService.deleteManagedPhoto(photo);
    } catch (error) {
      this.logger.error(
        `[RidesService] Falha ao remover asset de foto apos ${context.action} para o usuario ${context.userId}: ${getErrorMessage(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async reconcileClients(
    userId: string,
    clientIds: Iterable<string>,
    executor: unknown,
  ) {
    for (const clientId of new Set(Array.from(clientIds).filter(Boolean))) {
      await this.clientPaymentReconciliationService.reconcileClientPayments(
        userId,
        clientId,
        executor,
      );
    }
  }

  private buildArchivePayload(
    userId: string,
    reason: RideArchiveReason,
  ): ArchiveRideInput {
    return {
      archivedAt: new Date(),
      archivedBy: userId,
      archiveReason: reason,
    };
  }

  private async recordLifecycleTransitions(
    userId: string,
    existingRide: Ride,
    updateData: {
      status?: Ride['status'];
      paymentStatus?: Ride['paymentStatus'];
    },
    executor: unknown,
  ) {
    if (updateData.status && updateData.status !== existingRide.status) {
      await this.rideLifecycleEventService.recordStatusChanged(
        userId,
        existingRide,
        updateData.status,
        executor,
      );
    }

    if (
      updateData.paymentStatus &&
      updateData.paymentStatus !== existingRide.paymentStatus
    ) {
      await this.rideLifecycleEventService.recordPaymentStatusChanged(
        userId,
        existingRide,
        updateData.paymentStatus,
        executor,
      );
    }
  }

  private logCreateTimings(
    userId: string,
    rideId: string | undefined,
    timings: RideCreateTimings,
    startedAt: number,
  ) {
    const totalMs = Date.now() - startedAt;
    const message =
      `[RidesService] Create timings para corrida ${rideId ?? 'desconhecida'} do usuario ${userId}: ` +
      `photo=${timings.photoValidationMs}ms subscription=${timings.subscriptionMs}ms ` +
      `transaction=${timings.transactionMs}ms client=${timings.clientLookupMs}ms ` +
      `snapshot=${timings.paymentSnapshotMs}ms insert=${timings.insertMs}ms ` +
      `lifecycle=${timings.lifecycleMs}ms reconciliationGate=${timings.reconciliationGateMs}ms ` +
      `reconciliation=${timings.reconciliationMs}ms finalRead=${timings.finalReadMs}ms ` +
      `invalidate=${timings.invalidateMs}ms total=${totalMs}ms`;

    if (totalMs > 1500 || timings.transactionMs > 1000) {
      this.logger.warn(message);
      return;
    }

    this.logger.debug(message);
  }

  private async shouldReconcileCreatedRide(
    userId: string,
    clientId: string,
    debtValue: number,
    executor: unknown,
  ) {
    if (debtValue > 0) {
      return true;
    }

    const paymentStats =
      await this.clientPaymentsRepository.getUnusedPaymentsStats(
        clientId,
        userId,
        executor,
      );

    return paymentStats.unusedPaymentsCount > 0;
  }

  private async restoreArchivedRides(
    userId: string,
    rides: Ride[],
    executor: unknown,
  ): Promise<Ride[]> {
    if (rides.length === 0) {
      throw new NotFoundException('Nenhuma corrida arquivada encontrada.');
    }

    const requiredBalanceByClient = new Map<string, number>();
    const clientIds = new Set<string>();

    for (const ride of rides) {
      clientIds.add(ride.clientId);
      const paidWithBalance = Number(ride.paidWithBalance ?? 0);

      if (paidWithBalance <= 0) {
        continue;
      }

      requiredBalanceByClient.set(
        ride.clientId,
        (requiredBalanceByClient.get(ride.clientId) ?? 0) + paidWithBalance,
      );
    }

    for (const clientId of clientIds) {
      const amount = requiredBalanceByClient.get(clientId) ?? 0;

      if (amount > 0) {
        await this.rideAccountingService.consumeExactClientBalanceOrThrow(
          userId,
          clientId,
          amount,
          executor,
        );
        continue;
      }

      await this.rideAccountingService.getClientOrThrow(
        userId,
        clientId,
        executor,
      );
    }

    if (rides.length === 1) {
      const restoredRide = await this.ridesRepository.restore(
        userId,
        rides[0].id,
        executor,
      );

      if (!restoredRide) {
        throw new NotFoundException(RIDE_NOT_FOUND_MESSAGE);
      }

      await this.rideLifecycleEventService.recordRestored(
        userId,
        rides,
        executor,
      );
      await this.reconcileClients(
        userId,
        rides.map((ride) => ride.clientId),
        executor,
      );

      return [restoredRide];
    }

    const restoredRides = await this.ridesRepository.restoreManyByIds(
      userId,
      rides.map((ride) => ride.id),
      executor,
    );

    if (restoredRides.length === 0) {
      throw new NotFoundException(RIDE_NOT_FOUND_MESSAGE);
    }

    await this.rideLifecycleEventService.recordRestored(
      userId,
      rides,
      executor,
    );
    await this.reconcileClients(
      userId,
      rides.map((ride) => ride.clientId),
      executor,
    );

    return restoredRides.filter((ride): ride is Ride => Boolean(ride));
  }

  async findAll(
    userId: string,
    limit: number = 20,
    cursor?: string,
    filters?: {
      status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
      paymentStatus?: 'PENDING' | 'PAID';
      clientId?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
    },
  ) {
    const parsedFilters = parseRideDateFilters(filters);

    return this.ridesRepository.findAll(userId, limit, cursor, parsedFilters);
  }

  async findArchived(
    userId: string,
    limit: number = 20,
    cursor?: string,
    filters?: {
      status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
      paymentStatus?: 'PENDING' | 'PAID';
      clientId?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
    },
  ) {
    const parsedFilters = parseRideDateFilters(filters);

    return this.ridesRepository.findArchived(
      userId,
      limit,
      cursor,
      parsedFilters,
    );
  }

  async create(userId: string, data: CreateRideDto): Promise<RideWithClient> {
    const startedAt = Date.now();
    const timings: RideCreateTimings = {
      photoValidationMs: 0,
      subscriptionMs: 0,
      transactionMs: 0,
      clientLookupMs: 0,
      paymentSnapshotMs: 0,
      insertMs: 0,
      lifecycleMs: 0,
      reconciliationGateMs: 0,
      reconciliationMs: 0,
      finalReadMs: 0,
      invalidateMs: 0,
    };

    const photoValidationStartedAt = Date.now();
    const photo = await this.ridePhotoReferenceService.validateForCreate(
      userId,
      data.photo,
    );
    timings.photoValidationMs = Date.now() - photoValidationStartedAt;
    this.logger.log(
      `[RidesService] Criando corrida para usuário ${userId}`,
      'RidesService',
    );

    const subscriptionStartedAt = Date.now();
    const sub = await this.subscriptionsService.findByUserId(userId);
    timings.subscriptionMs = Date.now() - subscriptionStartedAt;

    if (!sub) {
      this.logger.warn(
        `[RidesService] Plano não encontrado para usuário ${userId}`,
        'RidesService',
      );
      throw new ForbiddenException(PLAN_NOT_FOUND_MESSAGE);
    }

    const transactionStartedAt = Date.now();
    const result = await (this.drizzle.db as TransactionRunner).transaction(
      async (tx) => {
        const clientLookupStartedAt = Date.now();
        const paidWithBalance = data.useBalance
          ? await this.rideAccountingService.consumeClientBalance(
              userId,
              data.clientId,
              data.value,
              tx,
            )
          : (await this.rideAccountingService.getClientOrThrow(
              userId,
              data.clientId,
              tx,
            ),
            0);
        timings.clientLookupMs = Date.now() - clientLookupStartedAt;

        const paymentSnapshotStartedAt = Date.now();
        const {
          rideTotal,
          paidWithBalance: normalizedPaidWithBalance,
          paidExternally,
          debtValue,
          paymentStatus,
        } = this.rideAccountingService.resolvePaymentSnapshot({
          value: data.value,
          paidWithBalance,
          paymentStatus: data.paymentStatus,
        });
        timings.paymentSnapshotMs = Date.now() - paymentSnapshotStartedAt;

        const insertStartedAt = Date.now();
        const createdRide = await this.ridesRepository.create(
          {
            id: randomUUID(),
            clientId: data.clientId,
            value: rideTotal,
            paidWithBalance: normalizedPaidWithBalance,
            paidExternally,
            debtValue,
            location: data.location,
            notes: data.notes,
            status: data.status || 'COMPLETED',
            paymentStatus,
            rideDate: data.rideDate ? new Date(data.rideDate) : new Date(),
            photo,
            userId,
          },
          tx,
        );
        timings.insertMs = Date.now() - insertStartedAt;

        const lifecycleStartedAt = Date.now();
        try {
          await this.rideLifecycleEventService.recordCreated(
            userId,
            createdRide,
            tx,
          );
        } catch (error) {
          this.logger.error(
            `[RidesService] Falha ao registrar evento de criacao da corrida ${createdRide.id} para o usuario ${userId}: ${getErrorMessage(error)}`,
            error instanceof Error ? error.stack : undefined,
          );
        } finally {
          timings.lifecycleMs = Date.now() - lifecycleStartedAt;
        }

        const reconciliationGateStartedAt = Date.now();
        const shouldReconcile = await this.shouldReconcileCreatedRide(
          userId,
          data.clientId,
          debtValue,
          tx,
        );
        timings.reconciliationGateMs = Date.now() - reconciliationGateStartedAt;

        if (shouldReconcile) {
          const reconciliationStartedAt = Date.now();
          await this.reconcileClients(userId, [data.clientId], tx);
          timings.reconciliationMs = Date.now() - reconciliationStartedAt;
        }

        return createdRide;
      },
    );
    timings.transactionMs = Date.now() - transactionStartedAt;

    const finalReadStartedAt = Date.now();
    const createdRide = await this.getRideWithClientOrThrow(userId, result.id);
    timings.finalReadMs = Date.now() - finalReadStartedAt;

    const invalidateStartedAt = Date.now();
    await this.invalidateRideMutations(userId);
    timings.invalidateMs = Date.now() - invalidateStartedAt;
    this.logger.log(
      `[RidesService] Corrida ${result.id} criada com sucesso`,
      'RidesService',
    );
    this.logCreateTimings(userId, result.id, timings, startedAt);

    return createdRide;
  }

  async update(
    userId: string,
    id: string,
    data: UpdateRideDto,
  ): Promise<RideWithClient> {
    this.logger.log(`[RidesService] Atualizando corrida ${id}`, 'RidesService');

    const existingRide = await this.getRideWithClientOrThrow(userId, id);
    const nextPhoto = await this.ridePhotoReferenceService.validateForUpdate(
      userId,
      data.photo,
      existingRide.photo ?? null,
    );
    const normalizedData = {
      ...data,
      photo: nextPhoto,
    };
    const { nextClientId, refundAmount, updateData } =
      this.rideStatusService.prepareRideUpdate(existingRide, normalizedData);
    const previousPhotoToCleanup =
      nextPhoto !== undefined && nextPhoto !== existingRide.photo
        ? existingRide.photo
        : null;

    const result = await (this.drizzle.db as TransactionRunner).transaction(
      async (tx) => {
        if (normalizedData.clientId !== undefined) {
          await this.rideAccountingService.getClientOrThrow(
            userId,
            nextClientId,
            tx,
          );
        }

        await this.rideAccountingService.refundClientBalance(
          userId,
          existingRide.clientId,
          refundAmount,
          id,
          tx,
        );

        const updatedRide = await this.ridesRepository.update(
          userId,
          id,
          updateData,
          tx,
        );

        await this.recordLifecycleTransitions(
          userId,
          existingRide,
          updateData,
          tx,
        );
        await this.reconcileClients(
          userId,
          [existingRide.clientId, nextClientId],
          tx,
        );

        return updatedRide;
      },
    );

    if (!result) {
      throw new NotFoundException(RIDE_NOT_FOUND_MESSAGE);
    }

    const updatedRide = await this.getRideWithClientOrThrow(userId, id);
    await this.cleanupManagedRidePhoto(previousPhotoToCleanup, {
      action: 'update',
      userId,
    });
    await this.invalidateRideMutations(userId);
    this.logger.log(
      `[RidesService] Corrida ${id} atualizada com sucesso`,
      'RidesService',
    );
    return updatedRide;
  }

  async delete(userId: string, id: string): Promise<void> {
    this.logger.log(`[RidesService] Arquivando corrida ${id}`, 'RidesService');
    const startedAt = Date.now();
    const timings = {
      lookupMs: 0,
      transactionMs: 0,
      cleanupMs: 0,
      invalidateMs: 0,
    };

    const lookupStartedAt = Date.now();
    const existingRide = await this.getRideOrThrow(userId, id);
    timings.lookupMs = Date.now() - lookupStartedAt;

    const transactionStartedAt = Date.now();
    const archivePayload = this.buildArchivePayload(userId, 'user-delete');
    const result = await (this.drizzle.db as TransactionRunner).transaction(
      async (tx) => {
        await this.rideAccountingService.refundClientBalance(
          userId,
          existingRide.clientId,
          Number(existingRide.paidWithBalance ?? 0),
          id,
          tx,
        );

        const archivedRide = await this.ridesRepository.archive(
          userId,
          id,
          archivePayload,
          tx,
        );

        await this.rideLifecycleEventService.recordArchived(
          userId,
          [
            {
              ...existingRide,
              archiveReason: archivePayload.archiveReason,
            },
          ],
          tx,
        );
        await this.reconcileClients(userId, [existingRide.clientId], tx);

        return archivedRide;
      },
    );
    timings.transactionMs = Date.now() - transactionStartedAt;

    if (!result) {
      throw new NotFoundException(RIDE_NOT_FOUND_MESSAGE);
    }

    const invalidateStartedAt = Date.now();
    await this.invalidateRideMutations(userId);
    timings.invalidateMs = Date.now() - invalidateStartedAt;
    this.logger.log(
      `[RidesService] Corrida ${id} arquivada com sucesso`,
      'RidesService',
    );
    this.logger.debug(
      `[RidesService] Archive timings para corrida ${id}: lookup=${timings.lookupMs}ms transaction=${timings.transactionMs}ms cleanup=${timings.cleanupMs}ms invalidate=${timings.invalidateMs}ms total=${Date.now() - startedAt}ms`,
    );
  }

  async bulkDelete(
    userId: string,
    data: BulkDeleteRidesDto,
  ): Promise<{ requestedCount: number; deletedCount: number }> {
    this.logger.log(
      `[RidesService] Arquivando ${data.ids.length} corridas em lote para o usuario ${userId}`,
      'RidesService',
    );
    let deletedCount = 0;
    const archivePayload = this.buildArchivePayload(userId, 'bulk-delete');

    await (this.drizzle.db as TransactionRunner).transaction(async (tx) => {
      const ridesToDelete = await this.ridesRepository.findManyByIds(
        userId,
        data.ids,
        tx,
      );

      if (ridesToDelete.length === 0) {
        throw new NotFoundException('Nenhuma corrida encontrada.');
      }

      const refundByClient = new Map<string, number>();

      for (const ride of ridesToDelete) {
        const paidWithBalance = Number(ride.paidWithBalance ?? 0);

        if (paidWithBalance > 0) {
          refundByClient.set(
            ride.clientId,
            (refundByClient.get(ride.clientId) ?? 0) + paidWithBalance,
          );
        }
      }

      for (const [clientId, amount] of refundByClient.entries()) {
        await this.rideAccountingService.refundClientBalance(
          userId,
          clientId,
          amount,
          'bulk-delete',
          tx,
        );
      }

      const deletedRides = await this.ridesRepository.archiveManyByIds(
        userId,
        ridesToDelete.map((ride) => ride.id),
        archivePayload,
        tx,
      );
      deletedCount = deletedRides.length;

      await this.rideLifecycleEventService.recordArchived(
        userId,
        ridesToDelete.map((ride) => ({
          ...ride,
          archiveReason: archivePayload.archiveReason,
        })),
        tx,
      );
      await this.reconcileClients(
        userId,
        ridesToDelete.map((ride) => ride.clientId),
        tx,
      );
    });
    await this.invalidateRideMutations(userId);

    return {
      requestedCount: data.ids.length,
      deletedCount,
    };
  }

  async deleteAll(userId: string): Promise<{ success: true }> {
    this.logger.log(
      `[RidesService] Arquivando TODAS as corridas do usuário ${userId}`,
      'RidesService',
    );
    const archivePayload = this.buildArchivePayload(userId, 'bulk-delete');

    await (
      this.drizzle.db as {
        transaction<T>(
          callback: (tx: BulkDeleteTransaction) => Promise<T>,
        ): Promise<T>;
      }
    ).transaction(async (tx) => {
      const ridesWithBalance = await tx
        .select({
          id: this.drizzle.schema.rides.id,
          clientId: this.drizzle.schema.rides.clientId,
          paidWithBalance: this.drizzle.schema.rides.paidWithBalance,
        })
        .from(this.drizzle.schema.rides)
        .where(
          and(
            eq(this.drizzle.schema.rides.userId, userId),
            isNull(this.drizzle.schema.rides.archivedAt),
          ),
        );

      const refundByClient = new Map<string, number>();

      for (const ride of ridesWithBalance) {
        const paidWithBalance = Number(ride.paidWithBalance ?? 0);

        if (paidWithBalance > 0) {
          refundByClient.set(
            ride.clientId,
            (refundByClient.get(ride.clientId) ?? 0) + paidWithBalance,
          );
        }
      }

      for (const [clientId, amount] of refundByClient.entries()) {
        await this.rideAccountingService.refundClientBalance(
          userId,
          clientId,
          amount,
          'bulk-delete',
          tx,
        );
      }

      await this.ridesRepository.archiveAll(userId, archivePayload, tx);

      await this.rideLifecycleEventService.recordArchived(
        userId,
        ridesWithBalance.map((ride) => ({
          id: ride.id,
          userId,
          archiveReason: archivePayload.archiveReason,
        })),
        tx,
      );
      await this.reconcileClients(
        userId,
        ridesWithBalance.map((ride) => ride.clientId),
        tx,
      );
    });

    await this.invalidateRideMutations(userId);
    this.logger.log(
      `[RidesService] Todas as corridas do usuário ${userId} arquivadas com sucesso`,
      'RidesService',
    );
    return { success: true };
  }

  async restore(userId: string, id: string): Promise<RideWithClient> {
    this.logger.log(`[RidesService] Restaurando corrida ${id}`, 'RidesService');

    await (this.drizzle.db as TransactionRunner).transaction(async (tx) => {
      const archivedRide = await this.getArchivedRideOrThrow(userId, id, tx);
      await this.restoreArchivedRides(userId, [archivedRide], tx);
    });

    const restoredRide = await this.getRideWithClientOrThrow(userId, id);
    await this.invalidateRideMutations(userId);

    return restoredRide;
  }

  async restoreBulk(
    userId: string,
    data: RestoreBulkRidesDto,
  ): Promise<{ requestedCount: number; restoredCount: number }> {
    this.logger.log(
      `[RidesService] Restaurando ${data.ids.length} corridas em lote para o usuario ${userId}`,
      'RidesService',
    );
    let restoredCount = 0;

    await (this.drizzle.db as TransactionRunner).transaction(async (tx) => {
      const archivedRides = await this.ridesRepository.findArchivedManyByIds(
        userId,
        data.ids,
        tx,
      );
      const restoredRides = await this.restoreArchivedRides(
        userId,
        archivedRides,
        tx,
      );

      restoredCount = restoredRides.length;
    });

    await this.invalidateRideMutations(userId);

    return {
      requestedCount: data.ids.length,
      restoredCount,
    };
  }

  async updateStatus(userId: string, id: string, data: UpdateRideStatusDto) {
    const existingRide = await this.getRideWithClientOrThrow(userId, id);
    const updateData = this.rideStatusService.prepareStatusUpdate(
      existingRide,
      data,
    );

    const result = await (this.drizzle.db as TransactionRunner).transaction(
      async (tx) => {
        const updatedRide = await this.ridesRepository.updateStatus(
          userId,
          id,
          updateData,
          tx,
        );

        await this.recordLifecycleTransitions(
          userId,
          existingRide,
          updateData,
          tx,
        );
        await this.reconcileClients(userId, [existingRide.clientId], tx);

        return updatedRide;
      },
    );

    if (!result) {
      throw new NotFoundException(RIDE_NOT_FOUND_MESSAGE);
    }

    const updatedRide = await this.getRideWithClientOrThrow(userId, id);
    await this.invalidateRideMutations(userId);
    return updatedRide;
  }

  async getFrequentClients(userId: string) {
    const cached =
      await this.userDashboardCacheService.getFrequentClients<any>(userId);

    if (cached) {
      this.logger.debug(
        `[RidesService] CACHE HIT: frequent-clients:${userId}`,
        'RidesService',
      );
      return cached;
    }

    this.logger.debug(
      `[RidesService] CACHE MISS: frequent-clients:${userId}. Buscando no DB...`,
      'RidesService',
    );
    const result = await this.ridesRepository.getFrequentClients(userId);

    await this.userDashboardCacheService.setFrequentClients(userId, result);
    return result;
  }

  async countAll(userId: string) {
    return this.ridesRepository.countAll(userId);
  }

  async findByClient(
    userId: string,
    clientId: string,
    limit: number = 20,
    cursor?: string,
    filters?: {
      status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
      paymentStatus?: 'PENDING' | 'PAID';
      startDate?: string;
      endDate?: string;
      search?: string;
    },
  ) {
    const parsedFilters = parseRideDateFilters(filters);

    return this.ridesRepository.findByClient(
      userId,
      clientId,
      limit,
      cursor,
      parsedFilters,
    );
  }

  async getStats(userId: string, query: GetStatsDto): Promise<RideStatsResult> {
    const isCacheable =
      process.env.NODE_ENV === 'production' &&
      query.period !== 'custom' &&
      !query.clientId;

    if (isCacheable) {
      const cached = await this.userDashboardCacheService.getStats<any>(
        userId,
        query.period,
      );
      if (cached) {
        this.logger.debug(
          `[RidesService] CACHE HIT: stats:${userId}:${query.period}`,
          'RidesService',
        );
        return cached;
      }

      this.logger.debug(
        `[RidesService] CACHE MISS: stats:${userId}:${query.period}. Buscando no DB e mapeando...`,
        'RidesService',
      );
    }

    const { startDate, endDate } = getDatesFromPeriod(
      query.period,
      query.start,
      query.end,
    );
    const dbResult = await this.ridesRepository.getStats(
      userId,
      startDate,
      endDate,
      query.clientId,
    );

    const mappedResult = {
      count: dbResult.count,
      totalValue: dbResult.totalValue,
      rides: RideMapper.toHttpList(dbResult.rides),
    };

    if (isCacheable) {
      await this.userDashboardCacheService.setStats(
        userId,
        query.period,
        mappedResult,
      );
    }

    return mappedResult;
  }
}
