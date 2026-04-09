import { Test, TestingModule } from '@nestjs/testing';

import { CACHE_PROVIDER } from './interfaces/cache-provider.interface';
import { ProfileCacheService } from './profile-cache.service';

describe('ProfileCacheService', () => {
  let service: ProfileCacheService;
  let cacheMock: {
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
  };

  beforeEach(async () => {
    cacheMock = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileCacheService,
        { provide: CACHE_PROVIDER, useValue: cacheMock },
      ],
    }).compile();

    service = module.get<ProfileCacheService>(ProfileCacheService);
  });

  it('should cache and read profile payloads using the profile namespace', async () => {
    const profile = { id: 'user-1', name: 'Maria' };

    await service.set('user-1', profile);

    expect(cacheMock.set).toHaveBeenCalledWith('profile:user-1', profile, 600);

    cacheMock.get.mockResolvedValueOnce(profile);

    await expect(service.get('user-1')).resolves.toEqual(profile);
    expect(cacheMock.get).toHaveBeenCalledWith('profile:user-1');
  });

  it('should invalidate a profile through the encapsulated key builder', async () => {
    await service.invalidate('user-1');

    expect(cacheMock.del).toHaveBeenCalledWith('profile:user-1');
  });
});
