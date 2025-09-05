import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ProcessRequestSchema = z.object({
  process_text: z.string().min(1, 'Texto do processo é obrigatório'),
  instructions: z.string().optional(),
});

export class ProcessRequestDto extends createZodDto(ProcessRequestSchema) {
  @ApiProperty({
    description: 'Texto do processo trabalhista a ser analisado',
    example: 'PROCESSO TRABALHISTA Nº 123/2024...'
  })
  process_text: string;

  @ApiProperty({
    description: 'Instruções adicionais para a análise',
    required: false,
    example: 'Foque na análise de prazos processuais'
  })
  instructions?: string;
}

const ProcessResponseSchema = z.object({
  analysis: z.any(),
});

export class ProcessResponseDto extends createZodDto(ProcessResponseSchema) {
  @ApiProperty({
    description: 'Análise do processo',
    example: {
      analysis: [
        {
          problema: 'Prazo prescricional não observado',
          tipo: 'prazo',
          gravidade: 'alta',
          analise: 'O prazo de 2 anos para reclamar verbas rescisórias foi ultrapassado',
          recomendacao: 'Verificar se há interrupção ou suspensão do prazo',
          precedentes: ['Súmula 437 do TST']
        }
      ]
    }
  })
  analysis: any;
}

const UploadFileSchema = z.object({
  instructions: z.string().optional(),
});

export class UploadFileDto extends createZodDto(UploadFileSchema) {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Arquivo a ser analisado (PDF, DOCX ou TXT)'
  })
  file: Express.Multer.File;

  @ApiProperty({
    description: 'Instruções adicionais para a análise',
    required: false
  })
  instructions?: string;
}

const AnalysisProblemSchema = z.object({
  problema: z.string(),
  tipo: z.enum(['processual', 'contradição', 'fundamentação', 'prazo']),
  gravidade: z.enum(['alta', 'média', 'baixa']),
  analise: z.string(),
  recomendacao: z.string(),
  precedentes: z.array(z.string()),
});

export class AnalysisProblemDto extends createZodDto(AnalysisProblemSchema) {
  @ApiProperty({ description: 'Descrição do problema identificado' })
  problema: string;

  @ApiProperty({ 
    description: 'Tipo do problema',
    enum: ['processual', 'contradição', 'fundamentação', 'prazo']
  })
  tipo: 'processual' | 'contradição' | 'fundamentação' | 'prazo';

  @ApiProperty({ 
    description: 'Gravidade do problema',
    enum: ['alta', 'média', 'baixa']
  })
  gravidade: 'alta' | 'média' | 'baixa';

  @ApiProperty({ description: 'Análise detalhada do problema' })
  analise: string;

  @ApiProperty({ description: 'Recomendação para resolver o problema' })
  recomendacao: string;

  @ApiProperty({ 
    description: 'Precedentes relacionados',
    type: [String]
  })
  precedentes: string[];
}

const ErrorResponseSchema = z.object({
  detail: z.string(),
});

export class ErrorResponseDto extends createZodDto(ErrorResponseSchema) {
  @ApiProperty({ description: 'Mensagem de erro' })
  detail: string;
}
