import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Process } from '../../entities/process.entity';
import { S3ManagerService } from '../aws/s3-manager/s3-manager.service';
import { ResponseProcess } from '../processes/dto/response-process.dto';
import { ProcessesService } from '../processes/processes.service';
import { AnalyzerService } from './services/analyzer.service';
import { FileExtractorService } from './services/file-extractor.service';

@Injectable()
export class AssistantService {
  constructor(
    private readonly s3ManagerService: S3ManagerService,
    private readonly processesService: ProcessesService,
    private readonly analyzerService: AnalyzerService,
    private readonly fileExtractorService: FileExtractorService,
    private readonly configService: ConfigService,
  ) {}

  async analyzeFileAndCreateProcess(
    userId: number,
    file: Express.Multer.File,
    instructions?: string,
    name?: string,
    type?: string,
  ): Promise<Process> {
    const { processText, analysisResult } = await this.processFile(
      file,
      instructions,
    );

    if (analysisResult.error) {
      throw new BadRequestException(`Erro na análise: ${analysisResult.error}`);
    }

    const fileUrl = await this.s3ManagerService.uploadFile(
      file,
      this.configService.get<string>('AWS_S3_BUCKET_NAME')!,
    );

    return await this.processesService.create({
      userId,
      name,
      fileUrl,
      type,
      processText,
      analysis: analysisResult || [],
      additionalInstructions: instructions,
    });
  }

  async readFile(
    file: Express.Multer.File,
    instructions?: string,
  ): Promise<string> {
    const { analysisResult } = await this.processFile(file, instructions);

    if (analysisResult.error) {
      return analysisResult.rawText || 'Erro na análise do documento';
    }

    return JSON.stringify(analysisResult.analysis || []);
  }

  private async processFile(
    file: Express.Multer.File,
    instructions?: string,
  ): Promise<{
    processText: string;
    analysisResult: any;
  }> {
    const { fileBuffer, fileExtension } = await this.fileValidation(file);
    const processText = await this.fileExtractorService.extractTextFromFile(
      fileBuffer,
      fileExtension,
    );

    if (!processText || processText.trim().length < 10) {
      throw new BadRequestException(
        'Não foi possível extrair texto suficiente do arquivo.',
      );
    }

    const analysisResult = await this.analyzerService.analyze(
      processText,
      instructions,
      false,
    );

    return { processText, analysisResult };
  }

  // async analyze(
  //   processText: string,
  //   additionalInstructions?: string,
  // ): Promise<any> {
  //   if (!processText || processText.trim().length === 0) {
  //     throw new BadRequestException('O texto do processo não pode estar vazio');
  //   }
  //   const analysisResult = await this.analyzerService.analyze(
  //     processText,
  //     additionalInstructions,
  //   );

  //   if (analysisResult.error) {
  //     throw new BadRequestException(`Erro na análise: ${analysisResult.error}`);
  //   }

  //   return analysisResult.analysis || [];
  // }

  private async fileValidation(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }
    const filename = file.originalname;
    const fileExtension = filename.split('.').pop()?.toLowerCase() || '';
    if (!['pdf', 'doc', 'docx', 'txt'].includes(fileExtension)) {
      throw new BadRequestException(
        'Formato de arquivo não suportado. Use PDF, DOCX ou TXT.',
      );
    }
    return {
      filename,
      fileExtension,
      fileBuffer: file.buffer,
    };
  }

  async findAll(userId: number): Promise<ResponseProcess[]> {
    return await this.processesService.findAll(userId);
  }

  async findOne(id: number): Promise<ResponseProcess | null> {
    return await this.processesService.findOne(id);
  }
}
