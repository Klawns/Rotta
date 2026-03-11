import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { IClientsRepository } from './interfaces/clients-repository.interface';

describe('ClientsService', () => {
  let service: ClientsService;
  let repoMock: any;

  beforeEach(async () => {
    repoMock = {
      findAll: jest.fn().mockResolvedValue({ clients: [], total: 0 }),
      create: jest
        .fn()
        .mockResolvedValue({ id: 'uuid-123', name: 'Client Test' }),
      findOne: jest
        .fn()
        .mockResolvedValue({ id: 'uuid-123', name: 'Client Test' }),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: IClientsRepository,
          useValue: repoMock,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a client', async () => {
    const result = await service.create('user-1', { name: 'Client Test' });
    expect(result).toEqual({ id: 'uuid-123', name: 'Client Test' });
    expect(repoMock.create).toHaveBeenCalled();
  });
});
