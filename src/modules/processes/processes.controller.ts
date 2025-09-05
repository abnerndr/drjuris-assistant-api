import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProcessesService } from './processes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseProcess } from './dto/response-process.dto';

@ApiTags('Processes')
@Controller('processes')
@UseGuards(JwtAuthGuard)
export class ProcessesController {
  constructor(private readonly processesService: ProcessesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os processos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de processos retornada com sucesso',
  })
  async findAll(): Promise<ResponseProcess[]> {
    return this.processesService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Listar processos por usuário' })
  @ApiParam({
    name: 'userId',
    type: 'number',
    description: 'ID do usuário',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Processos do usuário retornados com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async findByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<ResponseProcess[]> {
    return this.processesService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar processo por ID' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID do processo',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Processo retornado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Processo não encontrado',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseProcess> {
    return this.processesService.findOne(id);
  }
}