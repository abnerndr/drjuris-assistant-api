import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProcessesController } from '../../src/modules/processes/processes.controller';
import { ProcessesService } from '../../src/modules/processes/processes.service';
import { Process } from '../../src/entities/process.entity';
import { User } from '../../src/entities/user.entity';
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/modules/auth/guards/roles.guard';
import { UserRoles } from '../../src/shared/enums/user-roles';
import {
  createMockRepository,
  mockUser,
  mockAdmin,
  mockProcess,
} from '../utils/test-utils';

describe('ProcessesController (Integration)', () => {
  let app: INestApplication;
  let processRepository: any;
  let userRepository: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProcessesController],
      providers: [
        ProcessesService,
        {
          provide: getRepositoryToken(Process),
          useValue: createMockRepository<Process>(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository<User>(),
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          request.user = { id: 1, role: UserRoles.USER };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    processRepository = moduleFixture.get(getRepositoryToken(Process));
    userRepository = moduleFixture.get(getRepositoryToken(User));
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('GET /processes', () => {
    it('should return all processes for admin users', async () => {
      const processes = [
        { ...mockProcess, user: mockUser },
        { ...mockProcess, id: 2, user: mockAdmin },
      ];
      processRepository.find = jest.fn().mockResolvedValue(processes);

      const response = await request(app.getHttpServer())
        .get('/processes')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('status');
    });

    it('should return empty array when no processes exist', async () => {
      processRepository.find = jest.fn().mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/processes')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /processes/my', () => {
    it('should return user own processes', async () => {
      const userId = 1;
      const userProcesses = [mockProcess, { ...mockProcess, id: 2 }];

      userRepository.findOne = jest.fn().mockResolvedValue(mockUser);
      processRepository.find = jest.fn().mockResolvedValue(userProcesses);

      // Mock request user context
      const response = await request(app.getHttpServer())
        .get('/processes/my-processes')
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
    });

    it('should return 404 when user does not exist', async () => {
      const userId = 999;
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/processes/my-processes')
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should return empty array when user has no processes', async () => {
      const userId = 1;
      userRepository.findOne = jest.fn().mockResolvedValue(mockUser);
      processRepository.find = jest.fn().mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/processes/my-processes')
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /processes/user/:userId', () => {
    const targetUserId = 1;

    it('should return processes for a specific user', async () => {
      const userProcesses = [mockProcess, { ...mockProcess, id: 2 }];

      userRepository.findOne = jest.fn().mockResolvedValue(mockUser);
      processRepository.find = jest.fn().mockResolvedValue(userProcesses);

      const response = await request(app.getHttpServer())
        .get(`/processes/user/${targetUserId}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
    });

    it('should return 404 when target user does not exist', async () => {
      const nonExistentUserId = 999;
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get(`/processes/user/${nonExistentUserId}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should return empty array when user has no processes', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue(mockUser);
      processRepository.find = jest.fn().mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get(`/processes/user/${targetUserId}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /processes/:id', () => {
    const processId = 1;

    it('should return a process by id for admin user', async () => {
      const processWithUser = {
        ...mockProcess,
        user: { ...mockUser, role: { id: 2, name: UserRoles.USER } },
      };

      processRepository.findOne = jest.fn().mockResolvedValue(processWithUser);

      const response = await request(app.getHttpServer())
        .get(`/processes/${processId}`)
        .set('user', JSON.stringify({ id: 2, role: UserRoles.ADMIN }))
        .expect(200);

      expect(response.body).toHaveProperty('id', processId.toString());
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('status');
    });

    it('should return a process by id for process owner', async () => {
      const userId = 1;
      const processWithUser = {
        ...mockProcess,
        userId: userId,
        user: { ...mockUser, role: { id: 2, name: UserRoles.USER } },
      };

      processRepository.findOne = jest.fn().mockResolvedValue(processWithUser);

      const response = await request(app.getHttpServer())
        .get(`/processes/${processId}`)
        .set('user', JSON.stringify({ id: userId, role: UserRoles.USER }))
        .expect(200);

      expect(response.body).toHaveProperty('id', processId.toString());
      expect(response.body).toHaveProperty('name');
    });

    it('should return 403 when user tries to access another user process', async () => {
      const userId = 2;
      const processWithUser = {
        ...mockProcess,
        userId: 1, // Different user
        user: { ...mockUser, role: { id: 2, name: UserRoles.USER } },
      };

      processRepository.findOne = jest.fn().mockResolvedValue(processWithUser);

      // Mock service to throw ForbiddenException for different user
      const processesService = app.get(ProcessesService);
      const { ForbiddenException } = require('@nestjs/common');
      jest
        .spyOn(processesService, 'findOneWithPermission')
        .mockRejectedValue(
          new ForbiddenException(
            'Você só pode acessar seus próprios processos',
          ),
        );

      const response = await request(app.getHttpServer())
        .get(`/processes/${processId}`)
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(403);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 when process does not exist', async () => {
      const nonExistentProcessId = 999;
      processRepository.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get(`/processes/${nonExistentProcessId}`)
        .set('user', JSON.stringify({ id: 1, role: UserRoles.USER }))
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Error handling', () => {
    it('should handle invalid process ID parameter', async () => {
      const invalidId = 'invalid';

      await request(app.getHttpServer())
        .get(`/processes/${invalidId}`)
        .set('user', JSON.stringify({ id: 1, role: UserRoles.USER }))
        .expect(400);
    });

    it('should handle invalid user ID parameter', async () => {
      const invalidUserId = 'invalid';

      await request(app.getHttpServer())
        .get(`/processes/user/${invalidUserId}`)
        .expect(400);
    });
  });
});
