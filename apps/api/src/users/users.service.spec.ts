import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { IUsersRepository } from './interfaces/users-repository.interface';

describe('UsersService', () => {
  let service: UsersService;
  let repoMock: any;

  beforeEach(async () => {
    repoMock = {
      findById: jest
        .fn()
        .mockResolvedValue({ id: '1', email: 'test@example.com' }),
      findByEmail: jest
        .fn()
        .mockResolvedValue({ id: '1', email: 'test@example.com' }),
      create: jest
        .fn()
        .mockResolvedValue({ id: '1', email: 'test@example.com' }),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: IUsersRepository,
          useValue: repoMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test',
      password: 'hash',
    };
    const result = await service.create(userData);
    expect(result).toEqual({ id: '1', email: 'test@example.com' });
    expect(repoMock.create).toHaveBeenCalled();
  });
});
