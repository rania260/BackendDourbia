// contribution.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Monument } from 'src/monument/entities/monument.entity';

export enum ContributionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum FileType {
  IMAGE = 'image',
  VIDEO = 'video',
  PDF = 'pdf',
}

@Entity()
export class Contribution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  text: string;

  @Column({ nullable: true })
  fileUrl: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: FileType,
  })
  fileType: FileType | null;

  @Column({
    default: ContributionStatus.PENDING,
    type: 'enum',
    enum: ContributionStatus,
  })
  status: ContributionStatus;

  @Column({ nullable: true, type: 'text' })
  decisionComment: string;

  @Column({ nullable: true })
  decidedById: number;

  @Column({ nullable: true })
  decidedAt: Date;

  @ManyToOne(() => User, (user) => user.contributions, {
    eager: true,
    nullable: false,
  })
  user: User;

  @ManyToOne(() => Monument, (monument) => monument.contributions, {
    eager: true,
    nullable: false,
  })
  monument: Monument;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
