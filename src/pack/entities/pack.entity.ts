import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Circuit } from '../../circuit/entities/circuit.entity';
import { Service } from '../../service/entities/service.entity';
import { PackPurchase } from './pack-purchase.entity';

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

  @OneToMany(() => PackPurchase, (purchase) => purchase.pack)
  purchases: PackPurchase[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
