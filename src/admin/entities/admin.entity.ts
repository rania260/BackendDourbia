import { Entity, Column, ChildEntity } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@ChildEntity()
@Entity('admins')
export class Admin extends User {
  @Column({ type: 'simple-array', default: [] })
  permissions: string[]; // ['manage_users', 'manage_content', etc.]

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ default: false })
  isSuperAdmin: boolean;

  @Column({ nullable: true, type: 'text' })
  notes: string; // Notes internes sur l'admin
}
