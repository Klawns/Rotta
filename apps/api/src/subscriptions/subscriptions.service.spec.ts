import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { ISubscriptionsRepository } from './interfaces/subscriptions-repository.interface';
import { CACHE_PROVIDER } from '../cache/interfaces/cache-provider.interface';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;

  beforeEach(async () => {
    const repoMock = {};
    const cacheMock = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: ISubscriptionsRepository, useValue: repoMock },
        { provide: CACHE_PROVIDER, useValue: cacheMock },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
