import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateProcessSchema = z.object({
  name: z
    .string()
    .max(100, 'O nome deve ter no máximo 100 caracteres')
    .optional(),
  type: z
    .string()
    .max(100, 'O tipo deve ter no máximo 100 caracteres')
    .optional(),
  processText: z.string().min(1, 'O texto do processo é obrigatório'),
  additionalInstructions: z.string().optional(),
  fileUrl: z
    .string()
    .max(255, 'A URL do arquivo deve ter no máximo 255 caracteres')
    .optional(),
});

export class CreateProcessDto extends createZodDto(CreateProcessSchema) {
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
    description: 'URL do arquivo anexado',
    required: false,
    maxLength: 255,
    example: 'https://storage.example.com/processo-123.pdf',
  })
  fileUrl?: string;
}
