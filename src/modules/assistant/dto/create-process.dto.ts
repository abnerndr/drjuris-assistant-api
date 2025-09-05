import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { AnalysisObject } from 'src/shared/interfaces/analysis';
import { z } from 'zod';

const CreateProcessSchema = z.object({
  userId: z.number(),
  name: z
    .string()
    .max(100, 'O nome deve ter no máximo 100 caracteres')
    .optional(),
  type: z
    .string()
    .max(100, 'O tipo deve ter no máximo 100 caracteres')
    .optional(),
  processText: z.string().min(1, 'O texto do processo é obrigatório'),
  analysis: z.array(
    z.object({
      problema: z.string(),
      tipo: z.string(),
      gravidade: z.string(),
      analise: z.string(),
      recomendacao: z.string(),
      precedentes: z.array(z.string()),
    }),
  ),
  additionalInstructions: z.string().optional(),
  fileUrl: z
    .string()
    .max(255, 'A URL do arquivo deve ter no máximo 255 caracteres')
    .optional(),
});

export class CreateProcessDto extends createZodDto(CreateProcessSchema) {
  @ApiProperty({
    description: 'ID do usuário',
    required: true,
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: 'Nome do processo',
    required: false,
    maxLength: 100,
    example: 'Processo Trabalhista 001/2024',
  })
  name?: string;

  @ApiProperty({
    description: 'Tipo do processo',
    required: false,
    maxLength: 100,
    example: 'Trabalhista',
  })
  type?: string;

  @ApiProperty({
    description: 'Texto completo do processo',
    example: 'PROCESSO TRABALHISTA Nº 123/2024...',
  })
  processText: string;

  @ApiProperty({
    description: 'Instruções adicionais para análise',
    required: false,
    example: 'Foque na análise de prazos processuais',
  })
  additionalInstructions?: string;

  @ApiProperty({
    description: 'Análise do processo',
    required: true,
    example: [
      {
        problema: 'Problema 1',
        tipo: 'Tipo 1',
        gravidade: 'Gravidade 1',
        analise: 'Análise 1',
        recomendacao: 'Recomendação 1',
        precedentes: ['Precedente 1', 'Precedente 2'],
      },
    ],
  })
  analysis: AnalysisObject[];

  @ApiProperty({
    description: 'URL do arquivo anexado',
    required: false,
    maxLength: 255,
    example: 'https://storage.example.com/processo-123.pdf',
  })
  fileUrl?: string;
}
