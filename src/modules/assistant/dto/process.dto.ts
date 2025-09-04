import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ProcessRequestDto {
  @ApiProperty({
    description: 'Texto do processo trabalhista a ser analisado',
    example: 'PROCESSO TRABALHISTA Nº 123/2024...'
  })
  @IsString()
  @IsNotEmpty()
  process_text: string;

  @ApiProperty({
    description: 'Instruções adicionais para a análise',
    required: false,
    example: 'Foque na análise de prazos processuais'
  })
  @IsString()
  @IsOptional()
  instructions?: string;
}

export class ProcessResponseDto {
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

export class UploadFileDto {
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
  @IsString()
  @IsOptional()
  instructions?: string;
}

export class AnalysisProblemDto {
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
  @IsArray()
  precedentes: string[];
}

export class ErrorResponseDto {
  @ApiProperty({ description: 'Mensagem de erro' })
  detail: string;
}
