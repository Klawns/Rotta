import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

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
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:3000'),
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
      const user = { id: '1', email: 'test@test.com', role: 'admin' };
      const loginResponse = { access_token: 'token', user };

      (authService.validateUser as jest.Mock).mockResolvedValue(user);
      (authService.login as jest.Mock).mockResolvedValue(loginResponse);

      const mockRes = {
        cookie: jest.fn(),
        json: jest.fn().mockImplementation((val) => val),
      };
      const result = await controller.login(
        {} as any,
        { email: 'test@test.com', password: 'password' },
        mockRes as any,
      );
      expect(result).toEqual({ user });
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new UnauthorizedException());

      const mockRes = { cookie: jest.fn(), json: jest.fn() }; // Added mockRes definition for context
      await expect(
        controller.login(
          {} as any,
          { email: 'test@test.com', password: 'wrong' },
          mockRes as any,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
