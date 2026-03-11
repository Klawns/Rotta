import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { DRIZZLE } from '../database/database.provider';

describe('ClientsService', () => {
  let service: ClientsService;
  let dbMock: any;

  beforeEach(async () => {
    dbMock = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([{ id: 'uuid-123', name: 'Client Test' }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: DRIZZLE,
          useValue: dbMock,
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
    expect(dbMock.insert).toHaveBeenCalled();
  });
});
