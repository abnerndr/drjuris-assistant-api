import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { AssistantService } from '../../src/modules/assistant/assistant.service';
import { Process } from '../../src/entities/process.entity';
import { AnalyzerService } from '../../src/modules/assistant/services/analyzer.service';
import { FileExtractorService } from '../../src/modules/assistant/services/file-extractor.service';
import { CreateProcessDto } from '../../src/modules/assistant/dto/create-process.dto';
import {
  createMockRepository,
  mockProcess,
  mockFile,
  mockAnalysis,
} from '../utils/test-utils';

describe('AssistantService', () => {
  let service: AssistantService;
  let processRepository: any;
  let analyzerService: jest.Mocked<AnalyzerService>;
  let fileExtractorService: jest.Mocked<FileExtractorService>;

  const mockAnalyzerService = {
    analyze: jest.fn(),
  };

  const mockFileExtractorService = {
    extractTextFromFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssistantService,
        {
          provide: getRepositoryToken(Process),
          useValue: createMockRepository<Process>(),
        },
        {
          provide: AnalyzerService,
          useValue: mockAnalyzerService,
        },
        {
          provide: FileExtractorService,
          useValue: mockFileExtractorService,
        },
      ],
    }).compile();

    service = module.get<AssistantService>(AssistantService);
    processRepository = module.get(getRepositoryToken(Process));
    analyzerService = module.get(AnalyzerService);
    fileExtractorService = module.get(FileExtractorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeFile', () => {
    const userId = 1;
    const instructions = 'Test instructions';
    const name = 'Test Process';
    const type = 'trabalhista';
    const extractedText = 'Extracted text from file for analysis';

    it('should successfully analyze a file and create a process', async () => {
      fileExtractorService.extractTextFromFile.mockResolvedValue(extractedText);
      analyzerService.analyze.mockResolvedValue({ analysis: mockAnalysis });
      processRepository.save = jest.fn().mockResolvedValue(mockProcess);

      const result = await service.analyzeFile(
        userId,
        mockFile,
        instructions,
        name,
        type,
      );

      expect(fileExtractorService.extractTextFromFile).toHaveBeenCalledWith(
        mockFile.buffer,
        'pdf',
      );
      expect(analyzerService.analyze).toHaveBeenCalledWith(
        extractedText,
        instructions,
      );
      expect(processRepository.save).toHaveBeenCalledWith({
        userId,
        name,
        type,
        processText: extractedText,
        analysis: mockAnalysis,
        additionalInstructions: instructions,
      });
      expect(result).toEqual(mockProcess);
    });

    it('should throw BadRequestException when no file is provided', async () => {
      await expect(
        service.analyzeFile(userId, null as any, instructions, name, type),
      ).rejects.toThrow(new BadRequestException('Nenhum arquivo enviado'));
    });

    it('should throw BadRequestException for unsupported file format', async () => {
      const unsupportedFile = {
        ...mockFile,
        originalname: 'test.jpg',
      };

      await expect(
        service.analyzeFile(userId, unsupportedFile, instructions, name, type),
      ).rejects.toThrow(
        new BadRequestException(
          'Formato de arquivo não suportado. Use PDF, DOCX ou TXT.',
        ),
      );
    });

    it('should throw BadRequestException when extracted text is too short', async () => {
      fileExtractorService.extractTextFromFile.mockResolvedValue('short');

      await expect(
        service.analyzeFile(userId, mockFile, instructions, name, type),
      ).rejects.toThrow(
        new BadRequestException(
          'Não foi possível extrair texto suficiente do arquivo.',
        ),
      );
    });

    it('should throw BadRequestException when no text is extracted', async () => {
      fileExtractorService.extractTextFromFile.mockResolvedValue('');

      await expect(
        service.analyzeFile(userId, mockFile, instructions, name, type),
      ).rejects.toThrow(
        new BadRequestException(
          'Não foi possível extrair texto suficiente do arquivo.',
        ),
      );
    });
  });

  describe('readFile', () => {
    const instructions = 'Test instructions';
    const extractedText = 'Extracted text from file for analysis';

    it('should successfully read and analyze a file', async () => {
      fileExtractorService.extractTextFromFile.mockResolvedValue(extractedText);
      analyzerService.analyze.mockResolvedValue({ analysis: [] });

      const result = await service.readFile(mockFile, instructions);

      expect(fileExtractorService.extractTextFromFile).toHaveBeenCalledWith(
        mockFile.buffer,
        'pdf',
      );
      expect(analyzerService.analyze).toHaveBeenCalledWith(
        extractedText,
        instructions,
      );
      expect(result).toBe('[]');
    });

    it('should throw BadRequestException when extracted text is too short', async () => {
      fileExtractorService.extractTextFromFile.mockResolvedValue('short');

      await expect(service.readFile(mockFile, instructions)).rejects.toThrow(
        new BadRequestException(
          'Não foi possível extrair texto suficiente do arquivo.',
        ),
      );
    });
  });

  describe('analyze', () => {
    const processText = 'Sample process text for analysis';
    const instructions = 'Additional instructions';

    it('should successfully analyze process text', async () => {
      analyzerService.analyze.mockResolvedValue({ analysis: mockAnalysis });

      const result = await service.analyze(processText, instructions);

      expect(analyzerService.analyze).toHaveBeenCalledWith(
        processText,
        instructions,
      );
      expect(result).toEqual(mockAnalysis);
    });

    it('should throw BadRequestException when process text is empty', async () => {
      await expect(service.analyze('', instructions)).rejects.toThrow(
        new BadRequestException('O texto do processo não pode estar vazio'),
      );
    });

    it('should throw BadRequestException when process text is null', async () => {
      await expect(service.analyze(null as any, instructions)).rejects.toThrow(
        new BadRequestException('O texto do processo não pode estar vazio'),
      );
    });

    it('should throw BadRequestException when process text is only whitespace', async () => {
      await expect(service.analyze('   ', instructions)).rejects.toThrow(
        new BadRequestException('O texto do processo não pode estar vazio'),
      );
    });
  });

  describe('create', () => {
    it('should create a new process', async () => {
      const createProcessDto: CreateProcessDto = {
        userId: 1,
        name: 'Test Process',
        type: 'trabalhista',
        processText: 'Sample process text',
        analysis: mockAnalysis,
        additionalInstructions: 'Test instructions',
      };

      processRepository.save = jest.fn().mockResolvedValue(mockProcess);

      const result = await service.create(createProcessDto);

      expect(processRepository.save).toHaveBeenCalledWith(createProcessDto);
      expect(result).toEqual(mockProcess);
    });
  });

  describe('findAll', () => {
    const userId = 1;

    it('should return all processes for a user', async () => {
      const processes = [mockProcess, { ...mockProcess, id: 2 }];
      processRepository.find = jest.fn().mockResolvedValue(processes);

      const result = await service.findAll(userId);

      expect(processRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        relations: ['user'],
        where: { userId },
      });
      expect(result).toEqual(processes);
    });

    it('should return empty array when user has no processes', async () => {
      processRepository.find = jest.fn().mockResolvedValue([]);

      const result = await service.findAll(userId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a process by id', async () => {
      const processId = 1;
      processRepository.findOne = jest.fn().mockResolvedValue(mockProcess);

      const result = await service.findOne(processId);

      expect(processRepository.findOne).toHaveBeenCalledWith({
        where: { id: processId },
      });
      expect(result).toEqual(mockProcess);
    });

    it('should return null when process does not exist', async () => {
      const processId = 999;
      processRepository.findOne = jest.fn().mockResolvedValue(null);

      const result = await service.findOne(processId);

      expect(processRepository.findOne).toHaveBeenCalledWith({
        where: { id: processId },
      });
      expect(result).toBeNull();
    });
  });
});
