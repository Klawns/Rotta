import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenService } from './refresh-token/refresh-token.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { IRidesRepository } from '../rides/interfaces/rides-repository.interface';
import { CACHE_PROVIDER } from '../cache/interfaces/cache-provider.interface';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const usersServiceMock = {};
    const jwtServiceMock = {};
    const configServiceMock = {};
    const refreshTokenServiceMock = {};
    const subscriptionsServiceMock = {};
    const ridesRepositoryMock = {};
    const cacheProviderMock = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: RefreshTokenService, useValue: refreshTokenServiceMock },
        { provide: SubscriptionsService, useValue: subscriptionsServiceMock },
        { provide: IRidesRepository, useValue: ridesRepositoryMock },
        { provide: CACHE_PROVIDER, useValue: cacheProviderMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
