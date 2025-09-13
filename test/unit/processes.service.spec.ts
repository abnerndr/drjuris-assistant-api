import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProcessesService } from '../../src/modules/processes/processes.service';
import { Process } from '../../src/entities/process.entity';
import { User } from '../../src/entities/user.entity';
import { UserRoles } from '../../src/shared/enums/user-roles';
import {
  createMockRepository,
  mockUser,
  mockAdmin,
  mockProcess,
} from '../utils/test-utils';

describe('ProcessesService', () => {
  let service: ProcessesService;
  let processRepository: any;
  let userRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
    }).compile();

    service = module.get<ProcessesService>(ProcessesService);
    processRepository = module.get(getRepositoryToken(Process));
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByUserId', () => {
    it('should return processes for a valid user', async () => {
      const userId = 1;
      const processes = [mockProcess, { ...mockProcess, id: 2 }];

      userRepository.findOne = jest.fn().mockResolvedValue(mockUser);
      processRepository.find = jest.fn().mockResolvedValue(processes);

      const result = await service.findByUserId(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(processRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const userId = 999;

      userRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.findByUserId(userId)).rejects.toThrow(
        new NotFoundException(`Usuário com ID ${userId} não encontrado`),
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(processRepository.find).not.toHaveBeenCalled();
    });

    it('should return empty array when user has no processes', async () => {
      const userId = 1;

      userRepository.findOne = jest.fn().mockResolvedValue(mockUser);
      processRepository.find = jest.fn().mockResolvedValue([]);

      const result = await service.findByUserId(userId);

      expect(result).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should return all processes with user relations', async () => {
      const processes = [
        { ...mockProcess, user: mockUser },
        { ...mockProcess, id: 2, user: mockAdmin },
      ];

      processRepository.find = jest.fn().mockResolvedValue(processes);

      const result = await service.findAll();

      expect(processRepository.find).toHaveBeenCalledWith({
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
    });

    it('should return empty array when no processes exist', async () => {
      processRepository.find = jest.fn().mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a process by id', async () => {
      const processId = 1;
      const processWithUser = { ...mockProcess, user: mockUser };

      processRepository.findOne = jest.fn().mockResolvedValue(processWithUser);

      const result = await service.findOne(processId);

      expect(processRepository.findOne).toHaveBeenCalledWith({
        where: { id: processId },
        relations: ['user'],
      });
      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('name');
    });

    it('should throw NotFoundException when process does not exist', async () => {
      const processId = 999;

      processRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.findOne(processId)).rejects.toThrow(
        new NotFoundException(`Processo com ID ${processId} não encontrado`),
      );

      expect(processRepository.findOne).toHaveBeenCalledWith({
        where: { id: processId },
        relations: ['user'],
      });
    });
  });

  describe('findOneWithPermission', () => {
    const processId = 1;
    const userId = 1;
    const processWithUser = {
      ...mockProcess,
      id: Number(1),
      userId: 1,
      user: { ...mockUser, role: { id: 2, name: UserRoles.USER } },
    };

    it('should return process when user is admin', async () => {
      processRepository.findOne = jest.fn().mockResolvedValue(processWithUser);

      const result = await service.findOneWithPermission(
        processId,
        userId,
        UserRoles.ADMIN,
      );

      expect(processRepository.findOne).toHaveBeenCalledWith({
        where: { id: processId },
        relations: ['user', 'user.role'],
      });
      expect(result.id).toBe('1');
    });

    it('should return process when user owns the process', async () => {
      processRepository.findOne = jest.fn().mockResolvedValue(processWithUser);

      const result = await service.findOneWithPermission(
        processId,
        userId,
        UserRoles.USER,
      );

      expect(result.id).toBe('1');
    });

    it('should throw ForbiddenException when user does not own the process', async () => {
      const otherUserId = 2;
      processRepository.findOne = jest.fn().mockResolvedValue(processWithUser);

      await expect(
        service.findOneWithPermission(processId, otherUserId, UserRoles.USER),
      ).rejects.toThrow(
        new ForbiddenException('Você só pode acessar seus próprios processos'),
      );
    });

    it('should throw NotFoundException when process does not exist', async () => {
      processRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        service.findOneWithPermission(processId, userId, UserRoles.USER),
      ).rejects.toThrow(new NotFoundException('Processo não encontrado'));

      expect(processRepository.findOne).toHaveBeenCalledWith({
        where: { id: processId },
        relations: ['user', 'user.role'],
      });
    });
  });
});
