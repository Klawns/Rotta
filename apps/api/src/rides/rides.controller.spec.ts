import { Test, TestingModule } from '@nestjs/testing';
import { RidesController } from './rides.controller';
import { RidesService } from './rides.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import type { RequestWithUser } from '../auth/auth.types';

describe('RidesController', () => {
  let controller: RidesController;
  let ridesService: { getStats: jest.Mock };

  beforeEach(async () => {
    ridesService = {
      getStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RidesController],
      providers: [
        { provide: RidesService, useValue: ridesService },
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
  });
});
