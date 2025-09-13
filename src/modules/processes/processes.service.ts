import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Process } from 'src/entities/process.entity';
import { User } from 'src/entities/user.entity';
import { UserRoles } from 'src/shared/enums/user-roles';
import { Repository } from 'typeorm';
import { CreateProcessDto } from '../assistant/dto/create-process.dto';
import {
  ResponseProcess,
  transformProcessResponse,
} from './dto/response-process.dto';

@Injectable()
export class ProcessesService {
  constructor(
    @InjectRepository(Process)
    private readonly processRepository: Repository<Process>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(process: CreateProcessDto): Promise<Process> {
    return await this.processRepository.save(process);
  }

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

  async findAll(userId?: number): Promise<ResponseProcess[]> {
    let where = {};
    if (userId) {
      where = { userId: userId };
    }
    const processes = await this.processRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['user'],
      where,
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

  async findOneWithPermission(
    id: number,
    userId: number,
    userRole: string,
  ): Promise<ResponseProcess> {
    const process = await this.processRepository.findOne({
      where: { id },
      relations: ['user', 'user.role'],
    });

    if (!process) {
      throw new NotFoundException('Processo não encontrado');
    }

    // Administradores podem ver qualquer processo
    if (userRole === UserRoles.ADMIN) {
      return transformProcessResponse(process);
    }

    // Usuários comuns só podem ver seus próprios processos
    if (process.userId !== userId) {
      throw new ForbiddenException(
        'Você só pode acessar seus próprios processos',
      );
    }

    return transformProcessResponse(process);
  }
}
