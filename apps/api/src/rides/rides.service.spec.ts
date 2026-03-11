import { Test, TestingModule } from '@nestjs/testing';
import { RidesService } from './rides.service';
import { DRIZZLE } from '../database/database.provider';

describe('RidesService', () => {
  let service: RidesService;
  let dbMock: any;

  beforeEach(async () => {
    dbMock = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([{ id: 'ride-123', value: 25.5 }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RidesService,
        {
          provide: DRIZZLE,
          useValue: dbMock,
        },
      ],
    }).compile();

    service = module.get<RidesService>(RidesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a ride', async () => {
    const result = await service.create('user-1', { clientId: 'client-1', value: 25.5 });
    expect(result).toEqual({ id: 'ride-123', value: 25.5 });
    expect(dbMock.insert).toHaveBeenCalled();
  });
});
