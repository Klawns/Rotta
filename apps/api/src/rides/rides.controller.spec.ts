import { Test, TestingModule } from '@nestjs/testing';
import { RidesController } from './rides.controller';
import { RidesService } from './rides.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import type { RequestWithUser } from '../auth/auth.types';
import { RideResponsePresenterService } from './services/ride-response-presenter.service';
import type { Ride } from './interfaces/rides-repository.interface';

describe('RidesController', () => {
  let controller: RidesController;
  let ridesService: jest.Mocked<
    Pick<
      RidesService,
      | 'create'
      | 'delete'
      | 'deleteAll'
      | 'findArchived'
      | 'getStats'
      | 'restore'
      | 'restoreBulk'
      | 'update'
      | 'updateStatus'
    >
  >;
  let rideResponsePresenter: jest.Mocked<
    Pick<
      RideResponsePresenterService,
      'present' | 'presentList' | 'presentMappedList'
    >
  >;

  beforeEach(async () => {
    ridesService = {
      create: jest.fn(),
      delete: jest.fn(),
      deleteAll: jest.fn(),
      findArchived: jest.fn(),
      getStats: jest.fn(),
      restore: jest.fn(),
      restoreBulk: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
    } as jest.Mocked<
      Pick<
        RidesService,
        | 'create'
        | 'delete'
        | 'deleteAll'
        | 'findArchived'
        | 'getStats'
        | 'restore'
        | 'restoreBulk'
        | 'update'
        | 'updateStatus'
      >
    >;
    rideResponsePresenter = {
      present: jest.fn((ride: Ride) => Promise.resolve(ride)),
      presentList: jest.fn((rides: Ride[]) => Promise.resolve(rides)),
      presentMappedList: jest.fn((rides: Ride[]) => Promise.resolve(rides)),
    } as jest.Mocked<
      Pick<
        RideResponsePresenterService,
        'present' | 'presentList' | 'presentMappedList'
      >
    >;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RidesController],
      providers: [
        { provide: RidesService, useValue: ridesService },
        {
          provide: RideResponsePresenterService,
          useValue: rideResponsePresenter,
        },
        {
          provide: SubscriptionsService,
          useValue: {
            getAccessSnapshot: jest
              .fn()
              .mockResolvedValue({ status: 'active' }),
          },
        },
      ],
    }).compile();

    controller = module.get<RidesController>(RidesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should format stats responses as data plus meta', async () => {
    ridesService.getStats.mockResolvedValue({
      count: 2,
      totalValue: 45,
      rides: [
        {
          id: 'ride-1',
          value: 20,
          notes: null,
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          rideDate: new Date('2026-04-03T10:00:00.000Z'),
          createdAt: new Date('2026-04-03T10:00:00.000Z'),
          paidWithBalance: 0,
          debtValue: 0,
          location: 'Centro',
          photo: null,
          client: { id: 'client-1', name: 'Alice' },
        },
      ],
    });

    const request = {
      user: { id: 'user-1', role: 'user' },
    } as unknown as RequestWithUser;

    const result = await controller.getStats(request, { period: 'today' });

    expect(result).toEqual({
      data: [
        expect.objectContaining({
          id: 'ride-1',
          value: 20,
          client: {
            id: 'client-1',
            name: 'Alice',
          },
        }),
      ],
      meta: {
        count: 2,
        totalValue: 45,
      },
    });
    expect(rideResponsePresenter.presentMappedList).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'ride-1',
      }),
    ]);
  });

  it('should present created rides through the presenter before returning the response', async () => {
    const createdRide = {
      id: 'ride-1',
      photo: 'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
    };
    const presentedRide = {
      ...createdRide,
      photo: 'https://signed.example.com/ride-photo',
    };

    ridesService.create.mockResolvedValue(createdRide);
    rideResponsePresenter.present.mockResolvedValue(presentedRide);

    const request = {
      user: { id: 'user-1', role: 'user' },
    } as unknown as RequestWithUser;

    await expect(controller.create(request, {} as never)).resolves.toEqual(
      presentedRide,
    );

    expect(ridesService.create).toHaveBeenCalledWith('user-1', {});
    expect(rideResponsePresenter.present).toHaveBeenCalledWith(createdRide);
  });

  it('should present updated rides through the presenter before returning the response', async () => {
    const updatedRide = {
      id: 'ride-1',
      photo: 'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
    };
    const presentedRide = {
      ...updatedRide,
      photo: null,
    };

    ridesService.update.mockResolvedValue(updatedRide);
    rideResponsePresenter.present.mockResolvedValue(presentedRide);

    const request = {
      user: { id: 'user-1', role: 'user' },
    } as unknown as RequestWithUser;

    await expect(
      controller.update(request, 'ride-1', {} as never),
    ).resolves.toEqual(presentedRide);

    expect(ridesService.update).toHaveBeenCalledWith('user-1', 'ride-1', {});
    expect(rideResponsePresenter.present).toHaveBeenCalledWith(updatedRide);
  });

  it('should format archived rides responses as data plus meta', async () => {
    rideResponsePresenter.presentList.mockResolvedValueOnce([
      {
        id: 'ride-archived-1',
        value: 20,
        notes: null,
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        rideDate: new Date('2026-04-03T10:00:00.000Z').toISOString(),
        createdAt: new Date('2026-04-03T10:00:00.000Z').toISOString(),
        paidWithBalance: 5,
        debtValue: 0,
        location: 'Centro',
        photo: null,
        archivedAt: '2026-04-05T10:00:00.000Z',
        archivedBy: 'user-1',
        archiveReason: 'user-delete',
        client: { id: 'client-1', name: 'Alice' },
      },
    ]);
    ridesService.findArchived.mockResolvedValue({
      rides: [
        {
          id: 'ride-archived-1',
          value: 20,
          notes: null,
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          rideDate: new Date('2026-04-03T10:00:00.000Z'),
          createdAt: new Date('2026-04-03T10:00:00.000Z'),
          paidWithBalance: 5,
          debtValue: 0,
          location: 'Centro',
          photo: null,
          archivedAt: new Date('2026-04-05T10:00:00.000Z'),
          archivedBy: 'user-1',
          archiveReason: 'user-delete',
          client: { id: 'client-1', name: 'Alice' },
        },
      ],
      total: 1,
      hasNextPage: false,
    });

    const request = {
      user: { id: 'user-1', role: 'user' },
    } as unknown as RequestWithUser;

    const result = await controller.findArchived(request, { limit: 20 });

    expect(result).toEqual({
      data: [
        expect.objectContaining({
          id: 'ride-archived-1',
          archivedAt: '2026-04-05T10:00:00.000Z',
          archivedBy: 'user-1',
          archiveReason: 'user-delete',
        }),
      ],
      meta: {
        total: 1,
        hasNextPage: false,
      },
    });
    expect(ridesService.findArchived).toHaveBeenCalledWith(
      'user-1',
      20,
      undefined,
      {},
    );
    expect(rideResponsePresenter.presentList).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'ride-archived-1',
        archivedAt: new Date('2026-04-05T10:00:00.000Z'),
        archivedBy: 'user-1',
        archiveReason: 'user-delete',
      }),
    ]);
  });

  it('should present status updates through the presenter before returning the response', async () => {
    const updatedRide = {
      id: 'ride-1',
      status: 'COMPLETED',
    };

    ridesService.updateStatus.mockResolvedValue(updatedRide);

    const request = {
      user: { id: 'user-1', role: 'user' },
    } as unknown as RequestWithUser;

    await expect(
      controller.updateStatus(request, 'ride-1', {
        status: 'COMPLETED',
      } as never),
    ).resolves.toEqual(updatedRide);

    expect(ridesService.updateStatus).toHaveBeenCalledWith('user-1', 'ride-1', {
      status: 'COMPLETED',
    });
    expect(rideResponsePresenter.present).toHaveBeenCalledWith(updatedRide);
  });

  it('should return no content when a specific ride is removed', async () => {
    ridesService.delete.mockResolvedValue(undefined);

    const request = {
      user: { id: 'user-1', role: 'user' },
    } as unknown as RequestWithUser;

    await expect(controller.delete(request, 'ride-1')).resolves.toBeUndefined();

    expect(ridesService.delete).toHaveBeenCalledWith('user-1', 'ride-1');
    expect(rideResponsePresenter.present).not.toHaveBeenCalled();
  });

  it('should present restored rides through the presenter before returning the response', async () => {
    const restoredRide = {
      id: 'ride-1',
      archivedAt: null,
      archivedBy: null,
      archiveReason: null,
    };

    ridesService.restore.mockResolvedValue(restoredRide);
    rideResponsePresenter.present.mockResolvedValue(restoredRide);

    const request = {
      user: { id: 'user-1', role: 'user' },
    } as unknown as RequestWithUser;

    await expect(controller.restore(request, 'ride-1')).resolves.toEqual(
      restoredRide,
    );

    expect(ridesService.restore).toHaveBeenCalledWith('user-1', 'ride-1');
    expect(rideResponsePresenter.present).toHaveBeenCalledWith(restoredRide);
  });

  it('should delegate bulk restore to the service', async () => {
    ridesService.restoreBulk.mockResolvedValue({
      requestedCount: 2,
      restoredCount: 2,
    });

    const request = {
      user: { id: 'user-1', role: 'user' },
    } as unknown as RequestWithUser;

    await expect(
      controller.restoreBulk(request, { ids: ['ride-1', 'ride-2'] }),
    ).resolves.toEqual({
      requestedCount: 2,
      restoredCount: 2,
    });

    expect(ridesService.restoreBulk).toHaveBeenCalledWith('user-1', {
      ids: ['ride-1', 'ride-2'],
    });
  });
});
