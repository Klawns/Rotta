/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument -- Jest jobs and service mocks are intentionally partial. */
import { Test, TestingModule } from '@nestjs/testing';
import { ProfileCacheService } from '../../cache/profile-cache.service';
import { SubscriptionWebhookWorker } from './subscription-webhook.worker';
import { SubscriptionsService } from '../subscriptions.service';

describe('SubscriptionWebhookWorker', () => {
  let worker: SubscriptionWebhookWorker;
  let subscriptionsServiceMock: any;
  let profileCacheServiceMock: any;

  beforeEach(async () => {
    subscriptionsServiceMock = {
      updateOrCreate: jest.fn().mockResolvedValue(undefined),
    };

    profileCacheServiceMock = {
      invalidate: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionWebhookWorker,
        { provide: SubscriptionsService, useValue: subscriptionsServiceMock },
        { provide: ProfileCacheService, useValue: profileCacheServiceMock },
      ],
    }).compile();

    worker = module.get<SubscriptionWebhookWorker>(SubscriptionWebhookWorker);
  });

  it('should be defined', () => {
    expect(worker).toBeDefined();
  });

  it('should process webhook and invalidate cache', async () => {
    const jobMock = {
      id: 'job-1',
      data: {
        userId: 'user-123',
        plan: 'premium',
        eventId: 'evt-456',
      },
    } as any;

    await worker.process(jobMock);

    expect(subscriptionsServiceMock.updateOrCreate).toHaveBeenCalledWith(
      'user-123',
      'premium',
    );
    expect(profileCacheServiceMock.invalidate).toHaveBeenCalledWith('user-123');
  });

  it('should skip processing for invalid userId', async () => {
    const jobMock = {
      id: 'job-2',
      data: {
        userId: 'plan_123', // Invalid per logic
        plan: 'premium',
      },
    } as any;

    await worker.process(jobMock);

    expect(subscriptionsServiceMock.updateOrCreate).not.toHaveBeenCalled();
    expect(profileCacheServiceMock.invalidate).not.toHaveBeenCalled();
  });
});
