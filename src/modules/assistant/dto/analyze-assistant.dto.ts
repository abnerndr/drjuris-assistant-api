import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const AnalyzeAssistantSchema = z.object({
  instructions: z.string().optional(),
});

export class AnalyzeAssistantDto extends createZodDto(AnalyzeAssistantSchema) {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Arquivo a ser analisado (PDF, DOCX ou TXT)',
  })
  file: Express.Multer.File;

  @ApiProperty({
    description: 'Instruções adicionais para a análise',
    required: false,
  })
  instructions?: string;

  @ApiProperty({
    description: 'Nome do arquivo',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'Tipo do arquivo',
    required: false,
  })
  type?: string;
}
