import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserActivated } from '../auth/decorators/user-active.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AssistantService } from './assistant.service';
import { AnalyzeAssistantDto } from './dto/analyze-assistant.dto';
import { ProcessResponseDto, UploadFileDto } from './dto/process.dto';

@ApiTags('assistant')
@Controller('assistant')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('analyze')
  @UserActivated()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Enviar arquivo para análise' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo a ser analisado',
    type: AnalyzeAssistantDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Análise do processo',
    type: ProcessResponseDto,
  })
  async analyze(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { instructions?: string; name?: string; type?: string },
    @Request() req: { user: { id: number } },
  ) {
    return await this.assistantService.analyzeFileAndCreateProcess(
      Number(req.user.id),
      file,
      body.instructions,
      body.name,
      body.type,
    );
  }

  @Post('upload')
  @UserActivated()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Enviar arquivo para análise' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo a ser analisado',
    type: UploadFileDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Análise do processo',
    type: ProcessResponseDto,
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { instructions?: string },
  ) {
    return await this.assistantService.readFile(file, body.instructions);
  }

  @Get('process')
  @UserActivated()
  @ApiOperation({ summary: 'Listar todos os processos do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de processos',
    type: [ProcessResponseDto],
  })
  async getAllProcesses(@Request() req: { user: { id: number } }) {
    return await this.assistantService.findAll(Number(req.user.id));
  }

  @Get('process/:id')
  @UserActivated()
  @ApiOperation({ summary: 'Obter processo por ID' })
  @ApiParam({ name: 'id', description: 'ID do processo' })
  @ApiResponse({
    status: 200,
    description: 'Processo encontrado',
    type: ProcessResponseDto,
  })
  async getProcessById(@Param('id') id: number) {
    return await this.assistantService.findOne(id);
  }
}
