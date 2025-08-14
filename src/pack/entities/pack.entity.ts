import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Circuit } from '../../circuit/entities/circuit.entity';
import { Service } from '../../service/entities/service.entity';

@Entity()
export class Pack {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  prix: number;

  @ManyToOne(() => Circuit, (circuit) => circuit.packs)
  circuit: Circuit;

  @ManyToMany(() => Service)
  @JoinTable({
    name: 'pack_services',
    joinColumn: { name: 'pack_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'service_id', referencedColumnName: 'id' },
  })
  services: Service[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
