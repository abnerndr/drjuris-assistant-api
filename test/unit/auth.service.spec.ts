import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../../src/modules/auth/auth.service';
import { UsersService } from '../../src/modules/users/users.service';
import { mockUser, mockJwtService } from '../utils/test-utils';
import { User } from '../../src/entities/user.entity';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return user data without password when credentials are valid', async () => {
      const userWithPassword = {
        ...mockUser,
        password: 'hashedPassword',
      } as User;

      mockUsersService.findByEmail.mockResolvedValue(userWithPassword);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser(loginDto);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        loginDto.email,
        true,
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        'hashedPassword',
      );
      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        isActive: mockUser.isActive,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        role: mockUser.role,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should return null when user is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(loginDto);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        loginDto.email,
        true,
      );
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const userWithPassword = {
        ...mockUser,
        password: 'hashedPassword',
      } as User;

      mockUsersService.findByEmail.mockResolvedValue(userWithPassword);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validateUser(loginDto);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        loginDto.email,
        true,
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        'hashedPassword',
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      const user = mockUser as User;
      const expectedPayload = {
        email: user.email,
        sub: user.id,
        role: user.role?.name,
      };

      const result = await service.login(user);

      expect(mockJwtService.sign).toHaveBeenCalledWith(expectedPayload);
      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    });

    it('should handle user without role', async () => {
      const userWithoutRole: Partial<User> = {
        ...mockUser,
        role: undefined,
      };

      const expectedPayload = {
        email: userWithoutRole.email,
        sub: userWithoutRole.id,
        role: undefined,
      };

      const result = await service.login(userWithoutRole);

      expect(mockJwtService.sign).toHaveBeenCalledWith(expectedPayload);
      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          id: userWithoutRole.id,
          email: userWithoutRole.email,
          name: userWithoutRole.name,
          role: undefined,
        },
      });
    });
  });
});
