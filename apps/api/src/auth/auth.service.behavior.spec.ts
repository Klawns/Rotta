import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { AuthProfileService } from './auth-profile.service';
import { AuthService } from './auth.service';
import { RefreshTokenService } from './refresh-token/refresh-token.service';
import { CACHE_PROVIDER } from '../cache/interfaces/cache-provider.interface';
import type { ICacheProvider } from '../cache/interfaces/cache-provider.interface';
import { ProfileCacheService } from '../cache/profile-cache.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { UsersService } from '../users/users.service';

class InMemoryCacheProvider implements ICacheProvider {
  private readonly store = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | null> {
    return (this.store.get(key) as T | undefined) ?? null;
  }

  async set(key: string, value: unknown): Promise<void> {
    this.store.set(key, value);
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async getDel<T>(key: string): Promise<T | null> {
    const value = (this.store.get(key) as T | undefined) ?? null;

    this.store.delete(key);

    return value;
  }

  async invalidatePrefix(prefix: string): Promise<void> {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }
}

describe('AuthService cache-aside behavior', () => {
  let service: AuthService;
  let cacheProvider: InMemoryCacheProvider;

  const usersById = new Map<string, any>();
  const usersByEmail = new Map<string, any>();

  const usersServiceMock = {
    findByEmail: jest.fn(async (email: string) => usersByEmail.get(email)),
    findById: jest.fn(async (id: string) => usersById.get(id)),
    create: jest.fn(),
    update: jest.fn(async (id: string, data: Record<string, unknown>) => {
      const existingUser = usersById.get(id);

      if (!existingUser) {
        return;
      }

      const updatedUser = {
        ...existingUser,
        ...data,
      };

      usersById.set(id, updatedUser);
      usersByEmail.set(updatedUser.email, updatedUser);
    }),
  };

  const subscriptionsServiceMock = {
    getAccessSnapshot: jest.fn(async () => ({
      status: 'missing' as const,
      trialEndsAt: null,
      trialDaysRemaining: 0,
      isTrialExpiringSoon: false,
    })),
    updateOrCreate: jest.fn(),
  };

  const jwtServiceMock = {
    sign: jest.fn().mockReturnValue('signed-access-token'),
  };

  const refreshTokenServiceMock = {
    create: jest.fn().mockResolvedValue('refresh-token'),
  };

  beforeEach(async () => {
    usersById.clear();
    usersByEmail.clear();
    jest.clearAllMocks();

    const existingUser = {
      id: 'user-3',
      email: 'google@example.com',
      name: 'Existing User',
      password: '',
      role: 'user',
      taxId: null,
      cellphone: null,
      hasSeenTutorial: false,
      createdAt: new Date('2026-03-27T18:00:00.000Z'),
    };

    usersById.set(existingUser.id, existingUser);
    usersByEmail.set(existingUser.email, existingUser);

    cacheProvider = new InMemoryCacheProvider();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        AuthProfileService,
        ProfileCacheService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        {
          provide: RefreshTokenService,
          useValue: refreshTokenServiceMock,
        },
        { provide: SubscriptionsService, useValue: subscriptionsServiceMock },
        { provide: CACHE_PROVIDER, useValue: cacheProvider },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('returns a fresh profile after Google auth updates a user with stale cached data', async () => {
    const staleProfile = await service.getLatestProfile('user-3');

    expect(staleProfile).toEqual(
      expect.objectContaining({
        id: 'user-3',
        cellphone: null,
      }),
    );
    await expect(
      cacheProvider.get('profile:user-3'),
    ).resolves.toEqual(
      expect.objectContaining({
        cellphone: null,
      }),
    );

    const result = await service.validateGoogleUser(
      {
        email: 'google@example.com',
        firstName: 'Existing',
        lastName: 'User',
        accessToken: 'token',
      },
      '11999999999',
    );

    expect(usersServiceMock.update).toHaveBeenCalledWith('user-3', {
      cellphone: '11999999999',
    });
    expect(result.user).toEqual(
      expect.objectContaining({
        id: 'user-3',
        cellphone: '11999999999',
      }),
    );
    await expect(
      cacheProvider.get('profile:user-3'),
    ).resolves.toEqual(
      expect.objectContaining({
        cellphone: '11999999999',
      }),
    );
  });
});
