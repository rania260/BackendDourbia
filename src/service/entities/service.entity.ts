import { Partner } from 'src/partner/partner.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Partner, (partner) => partner.servicesList, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  partner: Partner;
}
