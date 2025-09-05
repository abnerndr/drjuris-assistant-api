import type { UserAddress } from 'src/shared/interfaces/user-address';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from './base';
import { Role } from './role.entity';

@Entity('users')
export class User extends Base {
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, name: 'document_number' })
  documentNumber: string;

  @Column({ type: 'jsonb', default: {} })
  address: UserAddress;

  @Column({ select: false })
  password: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'role_id' })
  roleId: string;
}
