/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    console.log(createUserDto);
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      relations: ['role'],
    });
  }

  async findOne(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { uuid: userId },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }
    return user;
  }

  async findByEmail(email: string, includePassword = false): Promise<User> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .leftJoinAndSelect('user.role', 'role');

    if (includePassword) {
      queryBuilder.addSelect('user.password');
    }

    const user = await queryBuilder.getOne();
    if (!user) {
      throw new NotFoundException(`User with email not found`);
    }
    return user;
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(userId);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    this.usersRepository.merge(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(userId: string): Promise<User> {
    const user = await this.findOne(userId);
    await this.usersRepository.remove(user);
    return user;
  }
}
