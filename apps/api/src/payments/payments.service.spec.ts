import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { IPaymentsRepository } from './interfaces/payments-repository.interface';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { PAYMENT_PROVIDER } from './providers/payment-provider.interface';
import { CACHE_PROVIDER } from '../cache/interfaces/cache-provider.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    const repoMock = {};
    const usersMock = {};
    const configMock = {};
    const providerMock = {};
    const cacheMock = {};
    const eventEmitterMock = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: IPaymentsRepository, useValue: repoMock },
        { provide: UsersService, useValue: usersMock },
        { provide: ConfigService, useValue: configMock },
        { provide: PAYMENT_PROVIDER, useValue: providerMock },
        { provide: CACHE_PROVIDER, useValue: cacheMock },
        { provide: EventEmitter2, useValue: eventEmitterMock },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
