import { ObjectLiteral, Repository } from 'typeorm';
import { Permission } from '../../src/entities/permission.entity';
import { Process } from '../../src/entities/process.entity';
import { Role } from '../../src/entities/role.entity';
import { User } from '../../src/entities/user.entity';
import { UserRoles } from '../../src/shared/enums/user-roles';
import { AnalysisProblemDto } from '../../src/modules/assistant/dto/process.dto';

// Mock entities
export const mockRole: Role = {
  id: 1,
  name: UserRoles.USER,
  description: 'User role',
  permissions: [] as Permission[],
  users: [] as User[],
};

export const mockAdminRole: Role = {
  id: 2,
  name: UserRoles.ADMIN,
  description: 'Admin role',
  permissions: [] as Permission[],
  users: [] as User[],
};

export const mockUser: Partial<User> = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedPassword',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  role: mockRole,
};

export const mockAdmin: Partial<User> = {
  id: 2,
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'hashedPassword',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  role: mockAdminRole,
};

export const mockAnalysis: AnalysisProblemDto[] = [
  {
    problema: 'Prazo processual próximo do vencimento',
    tipo: 'prazo' as const,
    gravidade: 'alta' as const,
    analise: 'Análise detalhada do problema',
    recomendacao: 'Tomar providências urgentes',
    precedentes: ['Precedente 1', 'Precedente 2'],
  },
];

export const mockProcess: Partial<Process> = {
  id: 1,
  userId: 1,
  name: 'Test Process',
  type: 'trabalhista',
  status: 'PENDING',
  processText: 'Sample process text for testing',
  analysis: mockAnalysis,
  additionalInstructions: 'Test instructions',
  createdAt: new Date(),
  updatedAt: new Date(),
  user: mockUser as User,
};

// Mock repository factory
export const createMockRepository = <T extends ObjectLiteral = any>(): Partial<
  Repository<T>
> => {
  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
  };

  return {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    merge: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };
};

// Mock JWT payload
export const mockJwtPayload = {
  email: 'test@example.com',
  sub: 1,
  role: UserRoles.USER,
};

// Mock file for testing
export const mockFile: Express.Multer.File = {
  fieldname: 'file',
  originalname: 'test.pdf',
  encoding: '7bit',
  mimetype: 'application/pdf',
  size: 1024,
  buffer: Buffer.from('test file content'),
  destination: '',
  filename: '',
  path: '',
  stream: null as any,
};

// Test database configuration
export const testDatabaseConfig = {
  type: 'sqlite' as const,
  database: ':memory:',
  entities: [User, Process, Role],
  synchronize: true,
  logging: false,
};

// Helper functions
export const createTestUser = (overrides: Partial<User> = {}): User =>
  ({
    ...mockUser,
    ...overrides,
  }) as User;

export const createTestProcess = (overrides: Partial<Process> = {}): Process =>
  ({
    ...mockProcess,
    ...overrides,
  }) as Process;

// Mock services
export const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue(mockJwtPayload),
};

export const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    const config = {
      JWT_SECRET: 'test-secret',
      MAX_TEXT_LENGTH: '6000',
      OPENAI_API_KEY: 'test-openai-key',
      GEMINI_API_KEY: 'test-gemini-key',
    };
    return config[key];
  }),
};

// Mock analysis result
export const mockAnalysisResult = {
  summary: 'Análise de processo trabalhista',
  problems: [
    {
      type: 'prazo',
      description: 'Prazo processual próximo do vencimento',
      severity: 'high',
      recommendation: 'Tomar providências urgentes',
    },
  ],
  recommendations: ['Verificar documentação', 'Acompanhar prazos processuais'],
};
