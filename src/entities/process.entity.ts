import type { AnalysisObject } from 'src/shared/interfaces/analysis';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from './base';
import { User } from './user.entity';

@Entity('processes')
export class Process extends Base {
  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  type: string;

  @Column({ type: 'varchar', length: 100, default: 'PENDING' })
  status: string;

  @Column({ type: 'text', name: 'process_text' })
  processText: string;

  @Column({ type: 'jsonb', nullable: true })
  analysis: AnalysisObject[];

  @Column({ type: 'text', name: 'additional_instructions', nullable: true })
  additionalInstructions?: string;

  @Column({ type: 'varchar', name: 'file_url', length: 255, nullable: true })
  fileUrl?: string;

  @ManyToOne(() => User, (user) => user.processes)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;
}
