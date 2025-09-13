import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserRoles } from 'src/shared/enums/user-roles';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/role.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ProcessesService } from './processes.service';
import { ResponseProcess } from './dto/response-process.dto';

@ApiTags('Processes')
@Controller('processes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProcessesController {
  constructor(private readonly processesService: ProcessesService) {}

  @Get()
  @Roles(UserRoles.ADMIN)
  @ApiOperation({
    summary: 'Listar todos os processos (apenas administradores)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de processos retornada com sucesso',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - apenas administradores',
  })
  async findAll(): Promise<ResponseProcess[]> {
    return this.processesService.findAll();
  }

  @Get('my-processes')
  @ApiOperation({ summary: 'Listar meus processos' })
  @ApiResponse({
    status: 200,
    description: 'Processos do usuário logado retornados com sucesso',
  })
  async findMyProcesses(
    @CurrentUser() user: { id: number; role: string },
  ): Promise<ResponseProcess[]> {
    return this.processesService.findByUserId(user.id);
  }

  @Get('user/:userId')
  @Roles(UserRoles.ADMIN)
  @ApiOperation({
    summary: 'Listar processos por usuário (apenas administradores)',
  })
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
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - apenas administradores',
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
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - você só pode acessar seus próprios processos',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: string },
  ): Promise<ResponseProcess> {
    return this.processesService.findOneWithPermission(id, user.id, user.role);
  }
}
