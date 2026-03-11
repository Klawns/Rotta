import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { IPaymentsRepository } from './interfaces/payments-repository.interface';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { PAYMENT_PROVIDER } from './providers/payment-provider.interface';
import { CACHE_PROVIDER } from '../cache/interfaces/cache-provider.interface';
import { getQueueToken } from '@nestjs/bullmq';

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    const repoMock = {};
    const usersMock = {};
    const configMock = {};
    const providerMock = {};
    const cacheMock = {};
    const queueMock = { add: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: IPaymentsRepository, useValue: repoMock },
        { provide: UsersService, useValue: usersMock },
        { provide: ConfigService, useValue: configMock },
        { provide: PAYMENT_PROVIDER, useValue: providerMock },
        { provide: CACHE_PROVIDER, useValue: cacheMock },
        { provide: getQueueToken('webhooks'), useValue: queueMock },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
