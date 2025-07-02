// contribution.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Monument } from 'src/monument/entities/monument.entity';

@Entity()
export class Contribution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  text: string;

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ nullable: true, type: 'enum', enum: ['image', 'video', 'pdf'] as const })
  fileType: 'image' | 'video' | 'pdf' | null;

  @Column({ default: 'pending', enum: ['pending', 'accepted', 'rejected'] })
  status: 'pending' | 'accepted' | 'rejected';

  @Column({ nullable: true })
  decisionComment: string;

  @Column({ nullable: true })
  decidedById: number;

  @Column({ nullable: true })
  decidedAt: Date;

  @ManyToOne(() => User, user => user.contributions, { eager: true })
  user: User;

  @ManyToOne(() => Monument, monument => monument.contributions, { eager: true })
  monument: Monument;

  @CreateDateColumn()
  createdAt: Date;
}