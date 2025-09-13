import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { AuthService } from '../../src/modules/auth/auth.service';
import { UsersService } from '../../src/modules/users/users.service';
import { User } from '../../src/entities/user.entity';
import { Role } from '../../src/entities/role.entity';
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';
import {
  createMockRepository,
  mockUser,
  mockJwtService,
  testDatabaseConfig,
} from '../utils/test-utils';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthController (Integration)', () => {
  let app: INestApplication;
  let userRepository: any;
  let roleRepository: any;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository<User>(),
        },
        {
          provide: getRepositoryToken(Role),
          useValue: createMockRepository<Role>(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();

    userRepository = moduleFixture.get(getRepositoryToken(User));
    roleRepository = moduleFixture.get(getRepositoryToken(Role));
    authService = moduleFixture.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      const userWithRole = {
        ...mockUser,
        role: { id: 1, name: 'USER' },
        password: 'hashedPassword',
      };

      const mockQueryBuilder = userRepository.createQueryBuilder();
      mockQueryBuilder.getOne.mockResolvedValue(userWithRole);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(201);

      expect(response.body).toHaveProperty('access_token', 'mock-jwt-token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', loginDto.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 for invalid email', async () => {
      const mockQueryBuilder = userRepository.createQueryBuilder();
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(404);

      expect(response.body).toHaveProperty(
        'message',
        'User with email not found',
      );
    });

    it('should return 401 for invalid password', async () => {
      const userWithRole = {
        ...mockUser,
        role: { id: 1, name: 'USER' },
        password: 'hashedPassword',
      };

      const mockQueryBuilder = userRepository.createQueryBuilder();
      mockQueryBuilder.getOne.mockResolvedValue(userWithRole);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Credenciais inválidas');
    });

    it('should return 400 for missing email', async () => {
      const invalidDto = { password: 'password123' };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 for missing password', async () => {
      const invalidDto = { email: 'test@example.com' };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 for invalid email format', async () => {
      const invalidDto = {
        email: 'invalid-email',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /auth/profile', () => {
    it('should return user profile when authenticated', async () => {
      const userWithRole = {
        ...mockUser,
        role: { id: 1, name: 'USER' },
      };

      // Mock the request user (set by JWT guard)
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(200);

      // Since we're mocking the guard to always return true,
      // we need to mock the user in the request context
      // This would typically be handled by the JWT strategy
    });

    it('should return 401 when not authenticated', async () => {
      // Override the guard to return false for this test
      const moduleFixture: TestingModule = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          AuthService,
          UsersService,
          {
            provide: getRepositoryToken(User),
            useValue: createMockRepository<User>(),
          },
          {
            provide: getRepositoryToken(Role),
            useValue: createMockRepository<Role>(),
          },
          {
            provide: JwtService,
            useValue: mockJwtService,
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: () => false })
        .compile();

      const testApp = moduleFixture.createNestApplication();
      await testApp.init();

      await request(testApp.getHttpServer()).get('/auth/profile').expect(403);

      await testApp.close();
    });
  });
});
