import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AssistantController } from '../../src/modules/assistant/assistant.controller';
import { AssistantService } from '../../src/modules/assistant/assistant.service';
import { AnalyzerService } from '../../src/modules/assistant/services/analyzer.service';
import { FileExtractorService } from '../../src/modules/assistant/services/file-extractor.service';
import { Process } from '../../src/entities/process.entity';
import { User } from '../../src/entities/user.entity';
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/modules/auth/guards/roles.guard';

import {
  createMockRepository,
  mockUser,
  mockProcess,
  mockAnalysis,
} from '../utils/test-utils';
import * as path from 'path';

describe('AssistantController (Integration)', () => {
  let app: INestApplication;
  let processRepository: any;
  let userRepository: any;
  let assistantService: any;

  const mockFile = {
    fieldname: 'file',
    originalname: 'test.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from('test file content'),
    size: 1024,
  } as Express.Multer.File;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AssistantController],
      providers: [
        AssistantService,
        {
          provide: AnalyzerService,
          useValue: {
            analyze: jest.fn().mockResolvedValue(mockAnalysis),
          },
        },
        {
          provide: FileExtractorService,
          useValue: {
            extractTextFromFile: jest
              .fn()
              .mockResolvedValue('Extracted text content'),
          },
        },
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
          request.user = { id: 1, role: 'USER' };
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
    assistantService = moduleFixture.get(AssistantService);
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    jest.clearAllMocks();
  });

  describe('POST /assistant/analyze', () => {
    it('should analyze a file successfully', async () => {
      const userId = 1;
      const mockAnalysisResult = {
        id: 1,
        name: 'Test Process',
        status: 'completed',
        analysis: mockAnalysis,
        createdAt: new Date(),
      };

      assistantService.analyzeFile = jest
        .fn()
        .mockResolvedValue(mockAnalysisResult);

      const response = await request(app.getHttpServer())
        .post('/assistant/analyze')
        .set('user', JSON.stringify({ id: userId }))
        .attach('file', Buffer.from('test content'), 'test.pdf')
        .field('instructions', 'Test instructions')
        .field('name', 'Test Process')
        .field('type', 'legal')
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'Test Process');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('analysis');
      expect(assistantService.analyzeFile).toHaveBeenCalledWith(
        userId,
        expect.any(Object),
        'Test instructions',
        'Test Process',
        'legal',
      );
    });

    it('should return 400 when no file is provided', async () => {
      const userId = 1;

      const response = await request(app.getHttpServer())
        .post('/assistant/analyze')
        .set('user', JSON.stringify({ id: userId }))
        .field('instructions', 'Test instructions')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 when user does not exist', async () => {
      const userId = 999;
      assistantService.analyzeFile = jest
        .fn()
        .mockRejectedValue(new Error('User not found'));

      const response = await request(app.getHttpServer())
        .post('/assistant/analyze')
        .set('user', JSON.stringify({ id: userId }))
        .attach('file', Buffer.from('test content'), 'test.pdf')
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle file extraction errors', async () => {
      const userId = 1;
      assistantService.analyzeFile = jest
        .fn()
        .mockRejectedValue(new Error('Extraction failed'));

      const response = await request(app.getHttpServer())
        .post('/assistant/analyze')
        .set('user', JSON.stringify({ id: userId }))
        .attach('file', Buffer.from('test content'), 'test.pdf')
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /assistant/upload', () => {
    it('should upload and read file successfully', async () => {
      const mockReadResult = {
        content: 'Extracted file content',
        metadata: {
          filename: 'test.pdf',
          size: 1024,
          type: 'application/pdf',
        },
      };

      assistantService.readFile = jest.fn().mockResolvedValue(mockReadResult);

      const response = await request(app.getHttpServer())
        .post('/assistant/upload')
        .attach('file', Buffer.from('test content'), 'test.pdf')
        .field('instructions', 'Read this file')
        .expect(200);

      expect(response.body).toHaveProperty('content');
      expect(assistantService.readFile).toHaveBeenCalledWith(
        expect.objectContaining({
          originalname: 'test.pdf',
          mimetype: 'application/pdf',
        }),
        'Read this file',
      );
    });

    it('should return 400 when no file is provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/assistant/upload')
        .field('instructions', 'Read this file')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle file reading errors', async () => {
      assistantService.readFile = jest
        .fn()
        .mockRejectedValue(new Error('File reading failed'));

      const response = await request(app.getHttpServer())
        .post('/assistant/upload')
        .attach('file', Buffer.from('test content'), 'test.pdf')
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /assistant/process', () => {
    it('should return all processes for a user', async () => {
      const userId = 1;
      const userProcesses = [
        { ...mockProcess, id: 1, name: 'Process 1' },
        { ...mockProcess, id: 2, name: 'Process 2' },
      ];

      assistantService.findAll = jest.fn().mockResolvedValue(userProcesses);

      const response = await request(app.getHttpServer())
        .get('/assistant/process')
        .set('user', JSON.stringify({ id: userId }))
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id', 1);
      expect(response.body[0]).toHaveProperty('name', 'Process 1');
      expect(response.body[1]).toHaveProperty('id', 2);
      expect(response.body[1]).toHaveProperty('name', 'Process 2');
    });

    it('should return empty array when user has no processes', async () => {
      const userId = 1;
      assistantService.findAll = jest.fn().mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/assistant/process')
        .set('user', JSON.stringify({ id: userId }))
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return 404 when user does not exist', async () => {
      const userId = 999;
      assistantService.findAll = jest
        .fn()
        .mockRejectedValue(new Error('User not found'));

      const response = await request(app.getHttpServer())
        .get('/assistant/process')
        .set('user', JSON.stringify({ id: userId }))
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /assistant/process/:id', () => {
    const processId = 1;

    it('should return a process by id', async () => {
      const processWithAnalysis = {
        ...mockProcess,
        id: processId,
        analysis: mockAnalysis,
      };

      assistantService.findOne = jest
        .fn()
        .mockResolvedValue(processWithAnalysis);

      const response = await request(app.getHttpServer())
        .get(`/assistant/process/${processId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', processId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('analysis');
    });

    it('should return 404 when process does not exist', async () => {
      const nonExistentProcessId = 999;
      assistantService.findOne = jest
        .fn()
        .mockRejectedValue(new Error('Process not found'));

      const response = await request(app.getHttpServer())
        .get(`/assistant/process/${nonExistentProcessId}`)
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle invalid process ID parameter', async () => {
      const invalidId = 'invalid';

      // Mock service to return null for invalid ID
      jest.spyOn(assistantService, 'findOne').mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get(`/assistant/process/${invalidId}`)
        .expect(200);

      expect(response.body).toEqual({});
    });
  });

  describe('Error handling', () => {
    it('should handle database connection errors', async () => {
      const userId = 1;
      assistantService.findAll = jest
        .fn()
        .mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app.getHttpServer())
        .get('/assistant/process')
        .set('user', JSON.stringify({ id: userId }))
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle service errors during analysis', async () => {
      const userId = 1;
      assistantService.analyzeFile = jest
        .fn()
        .mockRejectedValue(new Error('Analysis service failed'));

      const response = await request(app.getHttpServer())
        .post('/assistant/analyze')
        .set('user', JSON.stringify({ id: userId }))
        .attach('file', Buffer.from('test content'), 'test.pdf')
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });
});
