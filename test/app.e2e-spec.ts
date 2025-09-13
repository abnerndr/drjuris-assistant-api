import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { Process } from '../src/entities/process.entity';
import { User } from '../src/entities/user.entity';
import { Role } from '../src/entities/role.entity';
import { Permission } from '../src/entities/permission.entity';
import { createMockRepository } from './utils/test-utils';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(Process))
      .useValue(createMockRepository<Process>())
      .overrideProvider(getRepositoryToken(User))
      .useValue(createMockRepository<User>())
      .overrideProvider(getRepositoryToken(Role))
      .useValue(createMockRepository<Role>())
      .overrideProvider(getRepositoryToken(Permission))
      .useValue(createMockRepository<Permission>())
      .overrideProvider(getDataSourceToken())
      .useValue({
        initialize: jest.fn().mockResolvedValue(undefined),
        destroy: jest.fn().mockResolvedValue(undefined),
        isInitialized: true,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should start the application successfully', () => {
    expect(app).toBeDefined();
  });

  it('/auth/login (POST) - should return 400 for invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({})
      .expect(400);
  });
});
