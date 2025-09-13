import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ZodValidationPipe } from 'nestjs-zod';
import { UsersController } from '../../src/modules/users/users.controller';
import { UsersService } from '../../src/modules/users/users.service';
import { User } from '../../src/entities/user.entity';
import { Role } from '../../src/entities/role.entity';
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/modules/auth/guards/roles.guard';
import {
  createMockRepository,
  mockUser,
  mockAdmin,
  mockRole,
  mockAdminRole,
} from '../utils/test-utils';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersController (Integration)', () => {
  let app: INestApplication;
  let userRepository: any;
  let roleRepository: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository<User>(),
        },
        {
          provide: getRepositoryToken(Role),
          useValue: createMockRepository<Role>(),
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();

    userRepository = moduleFixture.get(getRepositoryToken(User));
    roleRepository = moduleFixture.get(getRepositoryToken(Role));
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      const users = [mockUser, mockAdmin];
      userRepository.find = jest.fn().mockResolvedValue(users);

      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('email');
      expect(response.body[0]).not.toHaveProperty('password');
    });

    it('should return empty array when no users exist', async () => {
      userRepository.find = jest.fn().mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      const userId = 1;
      userRepository.findOne = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', String(mockUser.id));
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 when user does not exist', async () => {
      const userId = 999;
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /users', () => {
    const createUserDto = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
      phone: '11999999999',
      documentNumber: '12345678901',
      roleId: 1,
      isActive: true,
    };

    it('should create a new user successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      const createdUser = {
        ...mockUser,
        ...createUserDto,
        password: hashedPassword,
      };

      roleRepository.findOne = jest.fn().mockResolvedValue(mockRole);
      userRepository.findOne = jest.fn().mockResolvedValue(null); // Email not exists
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      userRepository.save = jest.fn().mockResolvedValue(createdUser);

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', createUserDto.name);
      expect(response.body).toHaveProperty('email', createUserDto.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 400 for missing required fields', async () => {
      const invalidDto = {
        name: 'New User',
        // missing email, password, roleId
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 for invalid email format', async () => {
      const invalidDto = {
        ...createUserDto,
        email: 'invalid-email',
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 for short password', async () => {
      const invalidDto = {
        ...createUserDto,
        password: '123',
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 when email already exists', async () => {
      roleRepository.findOne = jest.fn().mockResolvedValue(mockRole);
      userRepository.findOne = jest.fn().mockResolvedValue(mockUser); // Email exists

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 when role does not exist', async () => {
      roleRepository.findOne = jest.fn().mockResolvedValue(null);
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PATCH /users/:id', () => {
    const userId = 1;
    const updateUserDto = {
      name: 'Updated User',
      password: 'newPassword123',
      isActive: true,
    };

    it('should update a user successfully', async () => {
      const hashedPassword = 'hashedNewPassword';
      const updatedUser = {
        ...mockUser,
        ...updateUserDto,
        password: hashedPassword,
      };

      userRepository.findOne = jest.fn().mockResolvedValue(mockUser);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      userRepository.save = jest.fn().mockResolvedValue(updatedUser);

      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send(updateUserDto)
        .expect(200);

      expect(response.body).toHaveProperty('name', updateUserDto.name);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should update user without hashing password when password is not provided', async () => {
      const updateDtoWithoutPassword = {
        name: 'Updated User',
        isActive: true,
      };
      const updatedUser = {
        ...mockUser,
        ...updateDtoWithoutPassword,
      };

      userRepository.findOne = jest.fn().mockResolvedValue(mockUser);
      userRepository.save = jest.fn().mockResolvedValue(updatedUser);

      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send(updateDtoWithoutPassword)
        .expect(200);

      expect(response.body).toHaveProperty(
        'name',
        updateDtoWithoutPassword.name,
      );
      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
    });

    it('should return 404 when user does not exist', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send(updateUserDto)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for invalid email format', async () => {
      const invalidDto = {
        email: 'invalid-email',
      };

      await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('DELETE /users/:id', () => {
    const userId = 1;

    it('should delete a user successfully', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue(mockUser);
      userRepository.remove = jest.fn().mockResolvedValue(mockUser);

      await request(app.getHttpServer()).delete(`/users/${userId}`).expect(200);

      expect(userRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 when user does not exist', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(userRepository.remove).not.toHaveBeenCalled();
    });
  });
});
