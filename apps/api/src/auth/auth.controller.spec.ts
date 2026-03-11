import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return login success', async () => {
      const user = { id: '1', email: 'test@test.com' };
      const loginResponse = { access_token: 'token', user };

      (authService.validateUser as jest.Mock).mockResolvedValue(user);
      (authService.login as jest.Mock).mockResolvedValue(loginResponse);

      const result = await controller.login({ email: 'test@test.com', password: 'password' });
      expect(result).toEqual(loginResponse);
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      (authService.validateUser as jest.Mock).mockResolvedValue(null);

      await expect(controller.login({ email: 'test@test.com', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});
