import { ApiProperty } from '@nestjs/swagger';
import type { JSONSchemaObject } from 'openai/lib/jsonschema';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('processes')
export class Process {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'ID único do processo' })
  id: number;

  @Column({ type: 'text' })
  @ApiProperty({ description: 'Texto do processo analisado' })
  processText: string;

  @Column({ type: 'json', nullable: true })
  @ApiProperty({ description: 'Análise do processo em formato JSON' })
  analysis: JSONSchemaObject;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'Instruções adicionais fornecidas' })
  additionalInstructions?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiProperty({ description: 'Nome do arquivo original' })
  originalFileName?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @ApiProperty({ description: 'Extensão do arquivo original' })
  fileExtension?: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Data da última atualização' })
  updatedAt: Date;
}
