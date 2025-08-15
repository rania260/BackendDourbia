import { User } from 'src/auth/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  service: string;

  @Column()
  type: string;

  @Column({ type: 'text' })
  description: string;

  @Column('text', { array: true })
  regions: string[];

  @Column('decimal', { precision: 10, scale: 2 })
  prix: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  requiresReservation: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'partnerId' })
  partner: User;
}
