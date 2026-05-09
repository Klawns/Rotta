/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/require-await -- Jest mocks in this spec intentionally use partial runtime stubs. */
import { ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RidesService } from './rides.service';
import { ProfileCacheService } from '../cache/profile-cache.service';
import { IRidesRepository } from './interfaces/rides-repository.interface';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { DRIZZLE } from '../database/database.provider';
import { UserDashboardCacheService } from '../cache/user-dashboard-cache.service';
import { RideAccountingService } from './services/ride-accounting.service';
import { RidePhotoReferenceService } from './services/ride-photo-reference.service';
import { RideStatusService } from './services/ride-status.service';
import { ClientPaymentReconciliationService } from '../clients/services/client-payment-reconciliation.service';
import { RideLifecycleEventService } from './services/ride-lifecycle-event.service';
import { IClientPaymentsRepository } from '../clients/interfaces/client-payments-repository.interface';

describe('RidesService', () => {
  const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

  let service: RidesService;
  let repoMock: any;
  let subsMock: any;
  let drizzleMock: any;
  let dashboardCacheMock: any;
  let profileCacheMock: any;
  let rideAccountingMock: any;
  let ridePhotoReferenceMock: any;
  let rideStatusMock: any;
  let reconciliationServiceMock: any;
  let rideLifecycleEventMock: any;
  let clientPaymentsRepoMock: any;
  let loggerErrorSpy: jest.SpyInstance;

  const sampleRide = {
    id: 'ride-456',
    displayId: 2,
    clientId: 'client-2',
    userId: 'user-1',
    value: 42,
    notes: 'Aeroporto',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    paidWithBalance: 10,
    paidExternally: 32,
    debtValue: 0,
    rideDate: new Date('2026-04-08T15:00:00.000Z'),
    createdAt: new Date('2026-04-08T15:05:00.000Z'),
    location: 'Terminal 1',
    photo: null,
    client: {
      id: 'client-2',
      name: 'Cliente C',
    },
  };

  beforeEach(async () => {
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    repoMock = {
      findAll: jest.fn().mockResolvedValue({ rides: [], total: 0 }),
      create: jest
        .fn()
        .mockResolvedValue({ id: 'ride-123', value: 25.5, userId: 'user-1' }),
      findOneWithClient: jest.fn().mockResolvedValue({
        id: 'ride-123',
        displayId: 1,
        clientId: 'client-1',
        userId: 'user-1',
        value: 25.5,
        notes: null,
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        paidWithBalance: 0,
        paidExternally: 25.5,
        debtValue: 0,
        rideDate: new Date('2026-04-08T12:28:00.000Z'),
        createdAt: new Date('2026-04-08T12:28:00.000Z'),
        location: 'Central Park',
        photo: null,
        client: {
          id: 'client-1',
          name: 'Cliente B',
        },
      }),
      findOne: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({ id: 'ride-123', value: 25.5 }),
      updateStatus: jest
        .fn()
        .mockResolvedValue({ id: 'ride-123', value: 25.5 }),
      archive: jest.fn().mockResolvedValue({ id: 'ride-123' }),
      findArchived: jest.fn().mockResolvedValue({ rides: [], total: 0 }),
      findArchivedOne: jest.fn().mockResolvedValue(null),
      findArchivedManyByIds: jest.fn().mockResolvedValue([]),
      findManyByIds: jest.fn().mockResolvedValue([]),
      archiveManyByIds: jest.fn().mockResolvedValue([]),
      archiveAll: jest.fn().mockResolvedValue(undefined),
      restore: jest.fn().mockResolvedValue({ id: 'ride-123' }),
      restoreManyByIds: jest.fn().mockResolvedValue([]),
      getStats: jest
        .fn()
        .mockResolvedValue({ count: 0, totalValue: 0, rides: [] }),
      countAll: jest.fn().mockResolvedValue(0),
      findByClient: jest.fn().mockResolvedValue({ rides: [], total: 0 }),
      getFrequentClients: jest.fn().mockResolvedValue([]),
    };

    subsMock = {
      findByUserId: jest.fn().mockResolvedValue({
        plan: 'premium',
        status: 'active',
        validUntil: new Date(),
      }),
    };

    dashboardCacheMock = {
      getStats: jest.fn().mockResolvedValue(null),
      setStats: jest.fn().mockResolvedValue(undefined),
      getFrequentClients: jest.fn().mockResolvedValue(null),
      setFrequentClients: jest.fn().mockResolvedValue(undefined),
      invalidate: jest.fn().mockResolvedValue(undefined),
    };

    profileCacheMock = {
      invalidate: jest.fn().mockResolvedValue(undefined),
    };

    rideAccountingMock = {
      getClientOrThrow: jest
        .fn()
        .mockResolvedValue({ id: 'client-1', balance: 0 }),
      consumeClientBalance: jest.fn().mockResolvedValue(0),
      consumeExactClientBalanceOrThrow: jest.fn().mockResolvedValue(undefined),
      refundClientBalance: jest.fn().mockResolvedValue(undefined),
      resolvePaymentSnapshot: jest.fn(
        ({
          value,
          paidWithBalance,
          paymentStatus,
        }: {
          value: number;
          paidWithBalance: number;
          paymentStatus?: 'PENDING' | 'PAID';
        }) => ({
          rideTotal: Number(value),
          paidWithBalance: Number(paidWithBalance ?? 0),
          paidExternally:
            paymentStatus === 'PENDING'
              ? 0
              : Number(value) - Number(paidWithBalance ?? 0),
          paymentStatus: paymentStatus === 'PENDING' ? 'PENDING' : 'PAID',
          debtValue:
            paymentStatus === 'PENDING'
              ? Number(value) - Number(paidWithBalance ?? 0)
              : 0,
        }),
      ),
    };

    ridePhotoReferenceMock = {
      validateForCreate: jest.fn(
        (_: string, photo: string | null | undefined) => photo,
      ),
      validateForUpdate: jest.fn(
        (_: string, photo: string | null | undefined) => photo,
      ),
      isManagedPhotoKey: jest.fn(
        (photo: string | null | undefined) =>
          typeof photo === 'string' && photo.startsWith('users/'),
      ),
      deleteManagedPhoto: jest.fn().mockResolvedValue(undefined),
    };

    drizzleMock = {
      schema: {
        rides: {
          id: 'rides.id',
          clientId: 'rides.clientId',
          paidWithBalance: 'rides.paidWithBalance',
          photo: 'rides.photo',
          userId: 'rides.userId',
        },
      },
      db: {
        transaction: jest.fn(async (callback: (tx: string) => unknown) =>
          callback('tx'),
        ),
      },
    };

    rideStatusMock = {
      prepareRideUpdate: jest.fn((existingRide: any, data: any) => ({
        nextClientId: data.clientId ?? existingRide.clientId,
        refundAmount: 0,
        updateData: data,
      })),
      prepareStatusUpdate: jest.fn(
        (
          _existingRide: any,
          data: { paymentStatus?: 'PENDING' | 'PAID'; status?: string },
        ) => ({
          ...data,
          debtValue:
            data.paymentStatus === 'PAID' || data.status === 'CANCELLED'
              ? 0
              : 25,
        }),
      ),
    };
    reconciliationServiceMock = {
      reconcileClientPayments: jest.fn().mockResolvedValue(undefined),
    };
    clientPaymentsRepoMock = {
      getUnusedPaymentsStats: jest.fn().mockResolvedValue({
        totalPaid: 0,
        unusedPaymentsCount: 0,
      }),
    };
    rideLifecycleEventMock = {
      recordCreated: jest.fn().mockResolvedValue(undefined),
      recordArchived: jest.fn().mockResolvedValue(undefined),
      recordRestored: jest.fn().mockResolvedValue(undefined),
      recordStatusChanged: jest.fn().mockResolvedValue(undefined),
      recordPaymentStatusChanged: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RidesService,
        {
          provide: IRidesRepository,
          useValue: repoMock,
        },
        {
          provide: SubscriptionsService,
          useValue: subsMock,
        },
        {
          provide: DRIZZLE,
          useValue: drizzleMock,
        },
        {
          provide: ProfileCacheService,
          useValue: profileCacheMock,
        },
        {
          provide: UserDashboardCacheService,
          useValue: dashboardCacheMock,
        },
        {
          provide: RideAccountingService,
          useValue: rideAccountingMock,
        },
        {
          provide: RidePhotoReferenceService,
          useValue: ridePhotoReferenceMock,
        },
        {
          provide: RideStatusService,
          useValue: rideStatusMock,
        },
        {
          provide: ClientPaymentReconciliationService,
          useValue: reconciliationServiceMock,
        },
        {
          provide: IClientPaymentsRepository,
          useValue: clientPaymentsRepoMock,
        },
        {
          provide: RideLifecycleEventService,
          useValue: rideLifecycleEventMock,
        },
      ],
    }).compile();

    service = module.get<RidesService>(RidesService);
  });

  afterEach(() => {
    process.env.NODE_ENV = ORIGINAL_NODE_ENV;
    loggerErrorSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a ride for premium user without mutating legacy rideCount', async () => {
    const result = await service.create('user-1', {
      clientId: 'client-1',
      value: 25.5,
      location: 'Central Park',
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      useBalance: false,
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: 'ride-123',
        clientId: 'client-1',
        client: {
          id: 'client-1',
          name: 'Cliente B',
        },
      }),
    );
    expect(rideAccountingMock.getClientOrThrow).toHaveBeenCalledWith(
      'user-1',
      'client-1',
      'tx',
    );
    expect(repoMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentStatus: 'PAID',
        debtValue: 0,
        paidWithBalance: 0,
        value: 25.5,
      }),
      'tx',
    );
    expect(ridePhotoReferenceMock.validateForCreate).toHaveBeenCalledWith(
      'user-1',
      undefined,
    );
    expect(subsMock.findByUserId).toHaveBeenCalledWith('user-1');
    expect(rideLifecycleEventMock.recordCreated).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        id: 'ride-123',
        userId: 'user-1',
      }),
      'tx',
    );
    expect(dashboardCacheMock.invalidate).toHaveBeenCalledWith('user-1');
    expect(profileCacheMock.invalidate).toHaveBeenCalledWith('user-1');
  });

  it('should skip full payment reconciliation when a paid ride has no open payments', async () => {
    await service.create('user-1', {
      clientId: 'client-1',
      value: 25.5,
      location: 'Central Park',
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      useBalance: false,
    });

    expect(clientPaymentsRepoMock.getUnusedPaymentsStats).toHaveBeenCalledWith(
      'client-1',
      'user-1',
      'tx',
    );
    expect(
      reconciliationServiceMock.reconcileClientPayments,
    ).not.toHaveBeenCalled();
  });

  it('should reconcile payment state during create when the ride creates debt', async () => {
    await service.create('user-1', {
      clientId: 'client-1',
      value: 25.5,
      location: 'Central Park',
      status: 'COMPLETED',
      paymentStatus: 'PENDING',
      useBalance: false,
    });

    expect(
      reconciliationServiceMock.reconcileClientPayments,
    ).toHaveBeenCalledWith('user-1', 'client-1', 'tx');
  });

  it('should reconcile payment state during create when the client has open payments', async () => {
    clientPaymentsRepoMock.getUnusedPaymentsStats.mockResolvedValueOnce({
      totalPaid: 25.5,
      unusedPaymentsCount: 1,
    });

    await service.create('user-1', {
      clientId: 'client-1',
      value: 25.5,
      location: 'Central Park',
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      useBalance: false,
    });

    expect(
      reconciliationServiceMock.reconcileClientPayments,
    ).toHaveBeenCalledWith('user-1', 'client-1', 'tx');
  });

  it('should list archived rides using the archived repository query', async () => {
    repoMock.findArchived.mockResolvedValueOnce({
      rides: [
        {
          ...sampleRide,
          archivedAt: new Date('2026-04-10T10:00:00.000Z'),
          archivedBy: 'user-1',
          archiveReason: 'user-delete',
        },
      ],
      total: 1,
      hasNextPage: false,
    });

    const result = await service.findArchived('user-1', 10, 'cursor-1', {
      clientId: 'client-2',
      search: 'Cliente',
    });

    expect(repoMock.findArchived).toHaveBeenCalledWith(
      'user-1',
      10,
      'cursor-1',
      {
        clientId: 'client-2',
        search: 'Cliente',
        startDate: undefined,
        endDate: undefined,
      },
    );
    expect(result).toEqual({
      rides: [
        expect.objectContaining({
          id: 'ride-456',
          archivedBy: 'user-1',
        }),
      ],
      total: 1,
      hasNextPage: false,
    });
  });

  it('should pass ride list date filters as inclusive Sao Paulo calendar days', async () => {
    await service.findAll('user-1', 20, undefined, {
      startDate: '2026-04-01',
      endDate: '2026-04-08',
    });

    const filters = repoMock.findAll.mock.calls[0][3];

    expect(filters.startDate.toISOString()).toBe('2026-04-01T03:00:00.000Z');
    expect(filters.endDate.toISOString()).toBe('2026-04-09T02:59:59.999Z');
  });

  it('should pass archived ride date filters as inclusive Sao Paulo calendar days', async () => {
    await service.findArchived('user-1', 20, undefined, {
      startDate: '2026-04-01',
      endDate: '2026-04-08',
    });

    const filters = repoMock.findArchived.mock.calls[0][3];

    expect(filters.startDate.toISOString()).toBe('2026-04-01T03:00:00.000Z');
    expect(filters.endDate.toISOString()).toBe('2026-04-09T02:59:59.999Z');
  });

  it('should pass client ride date filters as inclusive Sao Paulo calendar days', async () => {
    await service.findByClient('user-1', 'client-2', 20, undefined, {
      startDate: '2026-04-01',
      endDate: '2026-04-08',
    });

    const filters = repoMock.findByClient.mock.calls[0][4];

    expect(filters.startDate.toISOString()).toBe('2026-04-01T03:00:00.000Z');
    expect(filters.endDate.toISOString()).toBe('2026-04-09T02:59:59.999Z');
  });

  it('should allow creation if starter plan is active', async () => {
    subsMock.findByUserId.mockResolvedValueOnce({
      plan: 'starter',
      status: 'active',
      rideCount: 19,
    });

    await service.create('user-3', {
      clientId: 'client-3',
      value: 15,
      location: 'Uptown',
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      useBalance: false,
    });

    expect(repoMock.create).toHaveBeenCalled();
  });

  it('should stop ride creation when the managed photo reference is rejected', async () => {
    ridePhotoReferenceMock.validateForCreate.mockRejectedValueOnce(
      new NotFoundException('asset not found'),
    );

    await expect(
      service.create('user-1', {
        clientId: 'client-1',
        value: 25.5,
        photo: 'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
        useBalance: false,
      }),
    ).rejects.toThrow(NotFoundException);

    expect(repoMock.create).not.toHaveBeenCalled();
  });

  it('should zero debt when marking a ride as paid via status update', async () => {
    repoMock.findOneWithClient.mockResolvedValueOnce({
      id: 'ride-123',
      displayId: 1,
      clientId: 'client-1',
      userId: 'user-1',
      value: 30,
      paidWithBalance: 5,
      paymentStatus: 'PENDING',
      status: 'COMPLETED',
      debtValue: 25,
      notes: null,
      rideDate: new Date('2026-04-08T12:28:00.000Z'),
      createdAt: new Date('2026-04-08T12:28:00.000Z'),
      location: null,
      photo: null,
      client: {
        id: 'client-1',
        name: 'Cliente B',
      },
    });

    await service.updateStatus('user-1', 'ride-123', {
      paymentStatus: 'PAID',
    });

    expect(repoMock.updateStatus).toHaveBeenCalledWith(
      'user-1',
      'ride-123',
      expect.objectContaining({
        paymentStatus: 'PAID',
        debtValue: 0,
      }),
      'tx',
    );
    expect(dashboardCacheMock.invalidate).toHaveBeenCalledWith('user-1');
    expect(profileCacheMock.invalidate).toHaveBeenCalledWith('user-1');
  });

  it('should zero debt when cancelling a ride', async () => {
    repoMock.findOneWithClient.mockResolvedValueOnce({
      id: 'ride-123',
      displayId: 1,
      clientId: 'client-1',
      userId: 'user-1',
      value: 30,
      paidWithBalance: 5,
      paymentStatus: 'PENDING',
      status: 'COMPLETED',
      debtValue: 25,
      notes: null,
      rideDate: new Date('2026-04-08T12:28:00.000Z'),
      createdAt: new Date('2026-04-08T12:28:00.000Z'),
      location: null,
      photo: null,
      client: {
        id: 'client-1',
        name: 'Cliente B',
      },
    });

    await service.updateStatus('user-1', 'ride-123', {
      status: 'CANCELLED',
    });

    expect(repoMock.updateStatus).toHaveBeenCalledWith(
      'user-1',
      'ride-123',
      expect.objectContaining({
        status: 'CANCELLED',
        debtValue: 0,
      }),
      'tx',
    );
  });

  it('should restore debt when moving a cancelled ride back to an active status', async () => {
    repoMock.findOneWithClient.mockResolvedValueOnce({
      id: 'ride-123',
      displayId: 1,
      clientId: 'client-1',
      userId: 'user-1',
      value: 30,
      paidWithBalance: 5,
      paymentStatus: 'PENDING',
      status: 'CANCELLED',
      debtValue: 25,
      notes: null,
      rideDate: new Date('2026-04-08T12:28:00.000Z'),
      createdAt: new Date('2026-04-08T12:28:00.000Z'),
      location: null,
      photo: null,
      client: {
        id: 'client-1',
        name: 'Cliente B',
      },
    });
    rideStatusMock.prepareStatusUpdate.mockReturnValueOnce({
      status: 'COMPLETED',
      debtValue: 25,
    });

    await service.updateStatus('user-1', 'ride-123', {
      status: 'COMPLETED',
    });

    expect(repoMock.updateStatus).toHaveBeenCalledWith(
      'user-1',
      'ride-123',
      expect.objectContaining({
        status: 'COMPLETED',
        debtValue: 25,
      }),
      'tx',
    );
  });

  it('should throw not found when updating status for a missing ride', async () => {
    repoMock.findOneWithClient.mockResolvedValueOnce(null);

    await expect(
      service.updateStatus('user-1', 'missing', {
        paymentStatus: 'PAID',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should refund grouped balance usage when archiving all rides', async () => {
    drizzleMock.db.transaction = jest.fn(
      async (callback: (tx: { select: jest.Mock }) => unknown) =>
        callback({
          select: jest.fn().mockReturnValue({
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([
                {
                  id: 'ride-1',
                  clientId: 'client-1',
                  paidWithBalance: 5,
                  photo:
                    'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
                },
                {
                  id: 'ride-2',
                  clientId: 'client-1',
                  paidWithBalance: 2,
                  photo: 'https://legacy.example.com/photo.jpg',
                },
                {
                  id: 'ride-3',
                  clientId: 'client-2',
                  paidWithBalance: 0,
                  photo: null,
                },
              ]),
            }),
          }),
        }),
    );

    const result = await service.deleteAll('user-1');

    expect(rideAccountingMock.refundClientBalance).toHaveBeenCalledWith(
      'user-1',
      'client-1',
      7,
      'bulk-delete',
      expect.anything(),
    );
    expect(repoMock.archiveAll).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        archivedBy: 'user-1',
        archiveReason: 'bulk-delete',
      }),
      expect.anything(),
    );
    expect(ridePhotoReferenceMock.deleteManagedPhoto).not.toHaveBeenCalled();
    expect(dashboardCacheMock.invalidate).toHaveBeenCalledWith('user-1');
    expect(profileCacheMock.invalidate).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ success: true });
  });

  it('should bulk archive only the rides found for the user and refund grouped balances', async () => {
    repoMock.findManyByIds.mockResolvedValueOnce([
      {
        id: 'ride-1',
        clientId: 'client-1',
        userId: 'user-1',
        paidWithBalance: 3,
        photo: 'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
      },
      {
        id: 'ride-2',
        clientId: 'client-1',
        userId: 'user-1',
        paidWithBalance: 2,
        photo: null,
      },
    ]);
    repoMock.archiveManyByIds.mockResolvedValueOnce([
      { id: 'ride-1' },
      { id: 'ride-2' },
    ]);

    const result = await service.bulkDelete('user-1', {
      ids: ['ride-1', 'ride-2', 'ride-missing'],
    });

    expect(repoMock.findManyByIds).toHaveBeenCalledWith(
      'user-1',
      ['ride-1', 'ride-2', 'ride-missing'],
      'tx',
    );
    expect(rideAccountingMock.refundClientBalance).toHaveBeenCalledWith(
      'user-1',
      'client-1',
      5,
      'bulk-delete',
      'tx',
    );
    expect(repoMock.archiveManyByIds).toHaveBeenCalledWith(
      'user-1',
      ['ride-1', 'ride-2'],
      expect.objectContaining({
        archivedBy: 'user-1',
        archiveReason: 'bulk-delete',
      }),
      'tx',
    );
    expect(ridePhotoReferenceMock.deleteManagedPhoto).not.toHaveBeenCalled();
    expect(dashboardCacheMock.invalidate).toHaveBeenCalledWith('user-1');
    expect(profileCacheMock.invalidate).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({
      requestedCount: 3,
      deletedCount: 2,
    });
  });

  it('should throw not found when bulk delete has no valid rides', async () => {
    repoMock.findManyByIds.mockResolvedValueOnce([]);

    await expect(
      service.bulkDelete('user-1', {
        ids: ['missing-1', 'missing-2'],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(repoMock.archiveManyByIds).not.toHaveBeenCalled();
  });

  it('should return cached frequent clients without reading from the repository', async () => {
    const cachedClients = [
      { id: 'client-1', name: 'Cliente B', isPinned: true },
    ];
    dashboardCacheMock.getFrequentClients.mockResolvedValueOnce(cachedClients);

    const result = await service.getFrequentClients('user-1');

    expect(result).toEqual(cachedClients);
    expect(repoMock.getFrequentClients).not.toHaveBeenCalled();
    expect(dashboardCacheMock.setFrequentClients).not.toHaveBeenCalled();
  });

  it('should populate frequent clients cache after a cache miss', async () => {
    const frequentClients = [
      { id: 'client-2', name: 'Cliente C', isPinned: true },
    ];
    repoMock.getFrequentClients.mockResolvedValueOnce(frequentClients);

    const result = await service.getFrequentClients('user-1');

    expect(result).toEqual(frequentClients);
    expect(dashboardCacheMock.getFrequentClients).toHaveBeenCalledWith(
      'user-1',
    );
    expect(repoMock.getFrequentClients).toHaveBeenCalledWith('user-1');
    expect(dashboardCacheMock.setFrequentClients).toHaveBeenCalledWith(
      'user-1',
      frequentClients,
    );
  });

  it('should return cached production stats without reading from the repository', async () => {
    process.env.NODE_ENV = 'production';
    const cachedStats = {
      count: 1,
      totalValue: 42,
      rides: [
        {
          id: 'ride-456',
          value: 42,
          location: 'Terminal 1',
          notes: 'Aeroporto',
          photo: null,
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          rideDate: new Date('2026-04-08T15:00:00.000Z'),
          createdAt: new Date('2026-04-08T15:05:00.000Z'),
          paidWithBalance: 10,
          debtValue: 0,
          client: { id: 'client-2', name: 'Cliente C' },
        },
      ],
    };
    dashboardCacheMock.getStats.mockResolvedValueOnce(cachedStats);

    const result = await service.getStats('user-1', { period: 'month' });

    expect(result).toEqual(cachedStats);
    expect(dashboardCacheMock.getStats).toHaveBeenCalledWith('user-1', 'month');
    expect(repoMock.getStats).not.toHaveBeenCalled();
    expect(dashboardCacheMock.setStats).not.toHaveBeenCalled();
  });

  it('should populate production stats cache after a cache miss', async () => {
    process.env.NODE_ENV = 'production';
    repoMock.getStats.mockResolvedValueOnce({
      count: 1,
      totalValue: 42,
      rides: [sampleRide],
    });

    const result = await service.getStats('user-1', { period: 'month' });

    expect(dashboardCacheMock.getStats).toHaveBeenCalledWith('user-1', 'month');
    expect(repoMock.getStats).toHaveBeenCalledWith(
      'user-1',
      expect.any(Date),
      expect.any(Date),
      undefined,
    );
    expect(result).toEqual({
      count: 1,
      totalValue: 42,
      rides: [
        expect.objectContaining({
          id: 'ride-456',
          value: 42,
          client: { id: 'client-2', name: 'Cliente C' },
        }),
      ],
    });
    expect(dashboardCacheMock.setStats).toHaveBeenCalledWith(
      'user-1',
      'month',
      result,
    );
  });

  it('should bypass stats cache for custom periods and client-scoped stats', async () => {
    process.env.NODE_ENV = 'production';
    repoMock.getStats.mockResolvedValue({
      count: 1,
      totalValue: 42,
      rides: [sampleRide],
    });

    await service.getStats('user-1', {
      period: 'custom',
      start: '2026-04-01',
      end: '2026-04-08',
    });
    await service.getStats('user-1', {
      period: 'month',
      clientId: 'client-2',
    });

    expect(dashboardCacheMock.getStats).not.toHaveBeenCalled();
    expect(dashboardCacheMock.setStats).not.toHaveBeenCalled();
    expect(repoMock.getStats).toHaveBeenCalledTimes(2);
    expect(repoMock.getStats).toHaveBeenLastCalledWith(
      'user-1',
      expect.any(Date),
      expect.any(Date),
      'client-2',
    );
  });

  it('should handle concurrent cache misses in production stats without stale cache errors', async () => {
    process.env.NODE_ENV = 'production';
    repoMock.getStats.mockResolvedValue({
      count: 1,
      totalValue: 42,
      rides: [sampleRide],
    });

    const [firstResult, secondResult] = await Promise.all([
      service.getStats('user-1', { period: 'week' }),
      service.getStats('user-1', { period: 'week' }),
    ]);

    expect(firstResult).toEqual(secondResult);
    expect(repoMock.getStats).toHaveBeenCalledTimes(2);
    expect(dashboardCacheMock.setStats).toHaveBeenCalledTimes(2);
    expect(dashboardCacheMock.setStats).toHaveBeenNthCalledWith(
      1,
      'user-1',
      'week',
      firstResult,
    );
    expect(dashboardCacheMock.setStats).toHaveBeenNthCalledWith(
      2,
      'user-1',
      'week',
      secondResult,
    );
  });

  it('should invalidate dashboard and profile caches after updating a ride', async () => {
    repoMock.findOneWithClient.mockResolvedValueOnce({
      ...sampleRide,
      photo: 'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
    });
    repoMock.findOneWithClient.mockResolvedValueOnce({
      ...sampleRide,
      photo: null,
    });

    await service.update('user-1', 'ride-123', {
      value: 32,
      photo: null,
    });

    expect(ridePhotoReferenceMock.validateForUpdate).toHaveBeenCalledWith(
      'user-1',
      null,
      'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
    );
    expect(ridePhotoReferenceMock.deleteManagedPhoto).toHaveBeenCalledWith(
      'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
    );
    expect(dashboardCacheMock.invalidate).toHaveBeenCalledWith('user-1');
    expect(profileCacheMock.invalidate).toHaveBeenCalledWith('user-1');
  });

  it('should stop ride update when a new managed photo reference is rejected', async () => {
    repoMock.findOneWithClient.mockResolvedValueOnce({
      ...sampleRide,
      photo: null,
    });
    ridePhotoReferenceMock.validateForUpdate.mockRejectedValueOnce(
      new NotFoundException('asset not found'),
    );

    await expect(
      service.update('user-1', 'ride-123', {
        photo: 'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(repoMock.update).not.toHaveBeenCalled();
  });

  it('should invalidate dashboard and profile caches after archiving a ride', async () => {
    repoMock.findOne.mockResolvedValueOnce({
      ...sampleRide,
      photo: 'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
    });

    await expect(service.delete('user-1', 'ride-123')).resolves.toBeUndefined();

    expect(repoMock.archive).toHaveBeenCalledWith(
      'user-1',
      'ride-123',
      expect.objectContaining({
        archivedBy: 'user-1',
        archiveReason: 'user-delete',
      }),
      'tx',
    );
    expect(rideLifecycleEventMock.recordArchived).toHaveBeenCalledWith(
      'user-1',
      [
        expect.objectContaining({
          id: 'ride-456',
          userId: 'user-1',
          archiveReason: 'user-delete',
        }),
      ],
      'tx',
    );
    expect(ridePhotoReferenceMock.deleteManagedPhoto).not.toHaveBeenCalled();
    expect(dashboardCacheMock.invalidate).toHaveBeenCalledWith('user-1');
    expect(profileCacheMock.invalidate).toHaveBeenCalledWith('user-1');
  });

  it('should restore an archived ride and debit the consumed balance again', async () => {
    repoMock.findArchivedOne.mockResolvedValueOnce({
      ...sampleRide,
      id: 'ride-123',
      archivedAt: new Date('2026-04-09T15:00:00.000Z'),
      archivedBy: 'user-1',
      archiveReason: 'user-delete',
    });
    repoMock.restore.mockResolvedValueOnce({
      id: 'ride-123',
    });
    repoMock.findOneWithClient.mockResolvedValueOnce({
      ...sampleRide,
      id: 'ride-123',
      archivedAt: null,
      archivedBy: null,
      archiveReason: null,
    });

    const result = await service.restore('user-1', 'ride-123');

    expect(
      rideAccountingMock.consumeExactClientBalanceOrThrow,
    ).toHaveBeenCalledWith('user-1', 'client-2', 10, 'tx');
    expect(repoMock.restore).toHaveBeenCalledWith('user-1', 'ride-123', 'tx');
    expect(
      reconciliationServiceMock.reconcileClientPayments,
    ).toHaveBeenCalledWith('user-1', 'client-2', 'tx');
    expect(rideLifecycleEventMock.recordRestored).toHaveBeenCalledWith(
      'user-1',
      [
        expect.objectContaining({
          id: 'ride-123',
          userId: 'user-1',
        }),
      ],
      'tx',
    );
    expect(dashboardCacheMock.invalidate).toHaveBeenCalledWith('user-1');
    expect(profileCacheMock.invalidate).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(
      expect.objectContaining({
        id: 'ride-123',
        archivedAt: null,
      }),
    );
  });

  it('should throw not found when restoring a missing archived ride', async () => {
    repoMock.findArchivedOne.mockResolvedValueOnce(null);

    await expect(service.restore('user-1', 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(repoMock.restore).not.toHaveBeenCalled();
  });

  it('should surface insufficient balance when restoring an archived ride', async () => {
    repoMock.findArchivedOne.mockResolvedValueOnce({
      ...sampleRide,
      id: 'ride-123',
      archivedAt: new Date('2026-04-09T15:00:00.000Z'),
      archivedBy: 'user-1',
      archiveReason: 'user-delete',
    });
    rideAccountingMock.consumeExactClientBalanceOrThrow.mockRejectedValueOnce(
      new ConflictException('Saldo insuficiente para restaurar a corrida.'),
    );

    await expect(service.restore('user-1', 'ride-123')).rejects.toBeInstanceOf(
      ConflictException,
    );

    expect(repoMock.restore).not.toHaveBeenCalled();
  });

  it('should fail restore when the archived ride client no longer exists', async () => {
    repoMock.findArchivedOne.mockResolvedValueOnce({
      ...sampleRide,
      id: 'ride-123',
      paidWithBalance: 0,
      archivedAt: new Date('2026-04-09T15:00:00.000Z'),
      archivedBy: 'user-1',
      archiveReason: 'user-delete',
    });
    rideAccountingMock.getClientOrThrow.mockRejectedValueOnce(
      new NotFoundException('Cliente não encontrado.'),
    );

    await expect(service.restore('user-1', 'ride-123')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(repoMock.restore).not.toHaveBeenCalled();
  });

  it('should bulk restore archived rides atomically and reuse the restore core', async () => {
    repoMock.findArchivedManyByIds.mockResolvedValueOnce([
      {
        ...sampleRide,
        id: 'ride-1',
        clientId: 'client-1',
        paidWithBalance: 3,
        archivedAt: new Date('2026-04-09T15:00:00.000Z'),
      },
      {
        ...sampleRide,
        id: 'ride-2',
        clientId: 'client-1',
        paidWithBalance: 2,
        archivedAt: new Date('2026-04-09T16:00:00.000Z'),
      },
    ]);
    repoMock.restoreManyByIds.mockResolvedValueOnce([
      { id: 'ride-1' },
      { id: 'ride-2' },
    ]);

    const result = await service.restoreBulk('user-1', {
      ids: ['ride-1', 'ride-2', 'ride-1'],
    });

    expect(repoMock.findArchivedManyByIds).toHaveBeenCalledWith(
      'user-1',
      ['ride-1', 'ride-2', 'ride-1'],
      'tx',
    );
    expect(
      rideAccountingMock.consumeExactClientBalanceOrThrow,
    ).toHaveBeenCalledWith('user-1', 'client-1', 5, 'tx');
    expect(repoMock.restoreManyByIds).toHaveBeenCalledWith(
      'user-1',
      ['ride-1', 'ride-2'],
      'tx',
    );
    expect(rideLifecycleEventMock.recordRestored).toHaveBeenCalledWith(
      'user-1',
      [
        expect.objectContaining({ id: 'ride-1', userId: 'user-1' }),
        expect.objectContaining({ id: 'ride-2', userId: 'user-1' }),
      ],
      'tx',
    );
    expect(result).toEqual({
      requestedCount: 3,
      restoredCount: 2,
    });
  });

  it('should throw not found when bulk restore has no archived rides for the user', async () => {
    repoMock.findArchivedManyByIds.mockResolvedValueOnce([]);

    await expect(
      service.restoreBulk('user-1', {
        ids: ['missing-1', 'missing-2'],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(repoMock.restoreManyByIds).not.toHaveBeenCalled();
  });

  it('should surface dashboard cache invalidation failures after updating a ride', async () => {
    dashboardCacheMock.invalidate.mockRejectedValueOnce(
      new Error('dashboard cache invalidation failed'),
    );

    await expect(
      service.update('user-1', 'ride-123', {
        value: 32,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'ride-123',
      }),
    );

    expect(repoMock.update).toHaveBeenCalledWith(
      'user-1',
      'ride-123',
      expect.objectContaining({
        value: 32,
      }),
      'tx',
    );
    expect(profileCacheMock.invalidate).toHaveBeenCalledWith('user-1');
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Falha ao invalidar cache user dashboard'),
      expect.any(String),
    );
  });

  it('should record status and payment lifecycle events when updating status', async () => {
    repoMock.findOneWithClient.mockResolvedValueOnce({
      ...sampleRide,
      id: 'ride-123',
      status: 'PENDING',
      paymentStatus: 'PENDING',
      debtValue: 42,
      paidExternally: 0,
    });

    await service.updateStatus('user-1', 'ride-123', {
      status: 'COMPLETED',
      paymentStatus: 'PAID',
    });

    expect(rideLifecycleEventMock.recordStatusChanged).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        id: 'ride-123',
        status: 'PENDING',
      }),
      'COMPLETED',
      'tx',
    );
    expect(
      rideLifecycleEventMock.recordPaymentStatusChanged,
    ).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        id: 'ride-123',
        paymentStatus: 'PENDING',
      }),
      'PAID',
      'tx',
    );
  });

  it('should not record lifecycle transitions when status values stay the same', async () => {
    repoMock.findOneWithClient.mockResolvedValueOnce({
      ...sampleRide,
      id: 'ride-123',
      status: 'COMPLETED',
      paymentStatus: 'PAID',
    });

    await service.updateStatus('user-1', 'ride-123', {
      status: 'COMPLETED',
      paymentStatus: 'PAID',
    });

    expect(rideLifecycleEventMock.recordStatusChanged).not.toHaveBeenCalled();
    expect(
      rideLifecycleEventMock.recordPaymentStatusChanged,
    ).not.toHaveBeenCalled();
  });

  it('should keep successful ride creation when lifecycle event persistence fails', async () => {
    rideLifecycleEventMock.recordCreated.mockRejectedValueOnce(
      new Error('lifecycle unavailable'),
    );

    await expect(
      service.create('user-1', {
        clientId: 'client-1',
        value: 25.5,
        location: 'Central Park',
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        useBalance: false,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'ride-123',
      }),
    );

    expect(dashboardCacheMock.invalidate).toHaveBeenCalledWith('user-1');
    expect(profileCacheMock.invalidate).toHaveBeenCalledWith('user-1');
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Falha ao registrar evento de criacao'),
      expect.any(String),
    );
  });

  it('should keep successful ride creation even when cache invalidation fails after persistence', async () => {
    profileCacheMock.invalidate.mockRejectedValueOnce(
      new Error('profile cache invalidation failed'),
    );

    await expect(
      service.create('user-1', {
        clientId: 'client-1',
        value: 25.5,
        location: 'Central Park',
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        useBalance: false,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'ride-123',
      }),
    );

    expect(repoMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: 'client-1',
        userId: 'user-1',
      }),
      'tx',
    );
    expect(dashboardCacheMock.invalidate).toHaveBeenCalledWith('user-1');
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Falha ao invalidar cache profile'),
      expect.any(String),
    );
  });
});
