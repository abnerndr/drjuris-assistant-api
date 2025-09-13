import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../src/modules/users/users.service';
import { User } from '../../src/entities/user.entity';
import { Role } from '../../src/entities/role.entity';
import { CreateUserDto } from '../../src/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '../../src/modules/users/dto/update-user.dto';
import { mockUser, mockRole, createMockRepository } from '../utils/test-utils';
import { UserRoles } from '../../src/shared/enums/user-roles';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let roleRepository: Repository<Role>;

  const mockRepository = createMockRepository<User>();
  const mockRoleRepository = createMockRepository<Role>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '11999999999',
      documentNumber: '12345678901',
      roleId: 1,
      isActive: true,
    };

    it('should create a user with hashed password', async () => {
      const hashedPassword = 'hashedPassword123';
      const createdUser = {
        ...mockUser,
        ...createUserDto,
        password: hashedPassword,
      } as User;

      // Mock role repository to return a valid role
      (mockRoleRepository.findOne as jest.Mock).mockResolvedValue(mockRole);
      // Mock user repository to check if email exists (should return null for new user)
      (mockRepository.findOne as jest.Mock).mockResolvedValue(null);

      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      (mockRepository.create as jest.Mock).mockReturnValue(createdUser);
      (mockRepository.save as jest.Mock).mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(
        createUserDto.password,
        10,
      );
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });
  });

  describe('findAll', () => {
    it('should return all users with roles', async () => {
      const users = [mockUser, { ...mockUser, id: 2 }] as User[];
      (mockRepository.find as jest.Mock).mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['role'],
      });
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = 1;
      (mockRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findOne(userId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['role'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = 999;
      (mockRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow(
        new NotFoundException(`Usuário com ID ${userId} não encontrado`),
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['role'],
      });
    });
  });

  describe('findByEmail', () => {
    const email = 'test@example.com';
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    beforeEach(() => {
      (mockRepository.createQueryBuilder as jest.Mock) = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);
    });

    it('should return user by email without password', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail(email);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user.email = :email',
        { email },
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'user.role',
        'role',
      );
      expect(mockQueryBuilder.addSelect).not.toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should return user by email with password when includePassword is true', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail(email, true);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user.email = :email',
        { email },
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'user.role',
        'role',
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('user.password');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.findByEmail(email)).rejects.toThrow(
        new NotFoundException('User with email not found'),
      );
    });
  });

  describe('update', () => {
    const userId = 1;
    const updateUserDto: UpdateUserDto = {
      name: 'Updated User',
      password: 'newPassword123',
      isActive: true,
    };

    it('should update user with hashed password', async () => {
      const hashedPassword = 'hashedNewPassword';
      const updatedUser = {
        ...mockUser,
        ...updateUserDto,
        password: hashedPassword,
      } as User;

      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser as User);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      (mockRepository.merge as jest.Mock).mockImplementation((entity, dto) => {
        Object.assign(entity, dto);
        return entity;
      });
      (mockRepository.save as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(service.findOne).toHaveBeenCalledWith(userId);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(mockRepository.merge).toHaveBeenCalledWith(mockUser, {
        ...updateUserDto,
        password: hashedPassword,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(updatedUser);
    });

    it('should update user without hashing password when password is not provided', async () => {
      const updateDtoWithoutPassword: UpdateUserDto = {
        name: 'Updated User',
        isActive: true,
      };
      const updatedUser = {
        ...mockUser,
        ...updateDtoWithoutPassword,
      } as User;

      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser as User);
      (mockRepository.merge as jest.Mock).mockImplementation((entity, dto) => {
        Object.assign(entity, dto);
        return entity;
      });
      (mockRepository.save as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateDtoWithoutPassword);

      expect(service.findOne).toHaveBeenCalledWith(userId);
      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
      expect(mockRepository.merge).toHaveBeenCalledWith(
        mockUser,
        updateDtoWithoutPassword,
      );
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    const userId = 1;

    it('should remove and return the user', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser as User);
      (mockRepository.remove as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.remove(userId);

      expect(service.findOne).toHaveBeenCalledWith(userId);
      expect(mockRepository.remove).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      const notFoundError = new NotFoundException(
        `Usuário com ID ${userId} não encontrado`,
      );
      jest.spyOn(service, 'findOne').mockRejectedValue(notFoundError);

      await expect(service.remove(userId)).rejects.toThrow(notFoundError);

      expect(service.findOne).toHaveBeenCalledWith(userId);
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });
});
