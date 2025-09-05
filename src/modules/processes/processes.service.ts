import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Process } from 'src/entities/process.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import {
  transformProcessResponse,
  type ResponseProcess,
} from './dto/response-process.dto';

@Injectable()
export class ProcessesService {
  constructor(
    @InjectRepository(Process)
    private readonly processRepository: Repository<Process>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByUserId(userId: number): Promise<ResponseProcess[]> {
    // Verificar se o usuário existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Buscar todos os processos do usuário
    const processes = await this.processRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    // Transformar os processos usando o schema Zod
    return processes.map((process) => transformProcessResponse(process));
  }

  async findAll(): Promise<ResponseProcess[]> {
    const processes = await this.processRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return processes.map((process) => transformProcessResponse(process));
  }

  async findOne(id: number): Promise<ResponseProcess> {
    const process = await this.processRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!process) {
      throw new NotFoundException(`Processo com ID ${id} não encontrado`);
    }

    return transformProcessResponse(process);
  }
}
