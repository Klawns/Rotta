import { Test, TestingModule } from '@nestjs/testing';

import { ProfileCacheService } from '../cache/profile-cache.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { UsersService } from '../users/users.service';
import { AuthProfileService } from './auth-profile.service';

describe('AuthProfileService', () => {
  let service: AuthProfileService;
  let usersServiceMock: {
    findById: jest.Mock;
  };
  let subscriptionsServiceMock: {
    getAccessSnapshot: jest.Mock;
  };
  let profileCacheServiceMock: {
    get: jest.Mock;
    set: jest.Mock;
    invalidate: jest.Mock;
  };

  beforeEach(async () => {
    usersServiceMock = {
      findById: jest.fn(),
    };
    subscriptionsServiceMock = {
      getAccessSnapshot: jest.fn(),
    };
    profileCacheServiceMock = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      invalidate: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthProfileService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: SubscriptionsService, useValue: subscriptionsServiceMock },
        { provide: ProfileCacheService, useValue: profileCacheServiceMock },
      ],
    }).compile();

    service = module.get<AuthProfileService>(AuthProfileService);
  });

  it('should return a complete user profile and cache it', async () => {
    const createdAt = new Date('2026-03-27T18:00:00.000Z');
    const validUntil = new Date('2026-04-27T18:00:00.000Z');

    usersServiceMock.findById.mockResolvedValue({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed',
      role: 'user',
      taxId: '12345678901',
      cellphone: '11999999999',
      hasSeenTutorial: true,
      createdAt,
    });
    subscriptionsServiceMock.getAccessSnapshot.mockResolvedValue({
      status: 'active',
      subscription: {
        id: 'sub-1',
        userId: 'user-1',
        plan: 'premium',
        status: 'active',
        rideCount: 7,
        trialStartedAt: null,
        validUntil,
        createdAt,
      },
      trialEndsAt: null,
      trialDaysRemaining: 0,
      isTrialExpiringSoon: false,
    });

    const profile = await service.getLatestProfile('user-1');

    expect(profile).toEqual({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      taxId: '12345678901',
      cellphone: '11999999999',
      hasSeenTutorial: true,
      subscription: {
        plan: 'premium',
        status: 'active',
        trialStartedAt: null,
        trialEndsAt: null,
        trialDaysRemaining: 0,
        isTrialExpiringSoon: false,
        validUntil,
        rideCount: 7,
      },
      createdAt,
    });
    expect(profileCacheServiceMock.set).toHaveBeenCalledWith('user-1', profile);
  });

  it('should return cached profile without hitting dependencies', async () => {
    profileCacheServiceMock.get.mockResolvedValueOnce({
      id: 'user-1',
      name: 'Cached User',
      email: 'cached@example.com',
      role: 'user',
      taxId: null,
      cellphone: null,
      hasSeenTutorial: false,
      subscription: null,
      createdAt: new Date('2026-03-27T18:00:00.000Z'),
    });

    const result = await service.getLatestProfile('user-1');

    expect(result?.email).toBe('cached@example.com');
    expect(usersServiceMock.findById).not.toHaveBeenCalled();
    expect(subscriptionsServiceMock.getAccessSnapshot).not.toHaveBeenCalled();
  });

  it('should invalidate a cached profile', async () => {
    await service.invalidateProfile('user-1');

    expect(profileCacheServiceMock.invalidate).toHaveBeenCalledWith('user-1');
  });
});
