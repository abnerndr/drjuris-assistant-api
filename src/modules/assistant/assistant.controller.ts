import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AssistantService } from './assistant.service';
import { ErrorResponseDto, ProcessRequestDto, ProcessResponseDto, UploadFileDto } from './dto/process.dto';


@ApiTags('Process Analysis')
@Controller()
export class AssistantController {
  constructor(
    private readonly assistantService: AssistantService,
  ) {}



  @Post('upload')
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
  @ApiResponse({
    status: 400,
    description: 'Erro no arquivo enviado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ErrorResponseDto,
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { instructions?: string },
  ) {
    return await this.assistantService.readFile(file, body.instructions);
  }

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Analisar texto do processo' })
  @ApiBody({ type: ProcessRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Análise do processo',
    type: ProcessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Texto do processo vazio',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ErrorResponseDto,
  })
  async analyzeProcess(@Body() processRequest: ProcessRequestDto) {
    return await this.assistantService.analyze(processRequest.process_text, processRequest.instructions);
  }

  @Get('processes')
  @ApiOperation({ summary: 'Listar todos os processos analisados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de processos',
    type: [ProcessResponseDto],
  })
  async getAllProcesses() {
    return await this.assistantService.findAll();
  }

  @Get('processes/:id')
  @ApiOperation({ summary: 'Obter processo por ID' })
  @ApiParam({ name: 'id', description: 'ID do processo' })
  @ApiResponse({
    status: 200,
    description: 'Processo encontrado',
    type: ProcessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Processo não encontrado',
    type: ErrorResponseDto,
  })
  async getProcessById(@Param('id') id: number) {
    return await this.assistantService.findOne(id);
  }
}
