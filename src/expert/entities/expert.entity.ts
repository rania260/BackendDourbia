import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('experts')
export class Expert {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ type: 'simple-array', default: [] })
  specialities: string[]; // ['archéologue', 'historien', ...]

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array', default: [] })
  epochs: string[]; // ['punique', 'romaine', 'byzantine', 'beylicale', 'coloniale', ...]
}