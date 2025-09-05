import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Process } from '../../entities/process.entity';
import { CreateProcessDto } from './dto/create-process.dto';
import { AnalyzerService } from './services/analyzer.service';
import { FileExtractorService } from './services/file-extractor.service';

@Injectable()
export class AssistantService {
  constructor(
    @InjectRepository(Process)
    private processRepository: Repository<Process>,
    private readonly analyzerService: AnalyzerService,
    private readonly fileExtractorService: FileExtractorService,
  ) {}

  async analyzeFile(
    userId: number,
    file: Express.Multer.File,
    instructions?: string,
    name?: string,
    type?: string,
  ): Promise<Process> {
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
    const analysis = await this.analyzerService.analyze(
      processText,
      instructions,
    );
    return await this.create({
      userId,
      name,
      type,
      processText,
      analysis,
      additionalInstructions: instructions,
    });
  }

  async readFile(
    file: Express.Multer.File,
    instructions?: string,
  ): Promise<string> {
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
    const analysis = await this.analyzerService.analyze(
      processText,
      instructions,
    );
    return analysis;
  }

  async analyze(
    processText: string,
    additionalInstructions?: string,
  ): Promise<any> {
    if (!processText || processText.trim().length === 0) {
      throw new BadRequestException('O texto do processo não pode estar vazio');
    }
    const analysis = await this.analyzerService.analyze(
      processText,
      additionalInstructions,
    );
    return analysis;
  }

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

  async create(process: CreateProcessDto): Promise<Process> {
    return await this.processRepository.save(process);
  }

  async findAll(userId: number): Promise<Process[]> {
    return await this.processRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['user'],
      where: { userId },
    });
  }

  async findOne(id: number): Promise<Process | null> {
    return await this.processRepository.findOne({ where: { id } });
  }
}
