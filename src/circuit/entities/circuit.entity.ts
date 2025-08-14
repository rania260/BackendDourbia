import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Destination } from '../../destination/entities/destination.entity';
import { CircuitMonument } from './circuit-monument.entity';
import { Pack } from '../../pack/entities/pack.entity';

@Entity()
export class Circuit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  nom_circuit: string;

  @Column({ nullable: false, type: 'text' })
  description_thematique: string;

  @Column({ nullable: false })
  nbr_etape: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  kilometrage: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: false })
  duree_heures: number;

  @Column({ type: 'decimal', precision: 5, scale: 3, nullable: false })
  duree_minutes: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: false })
  depart_longitude_circuit: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: false })
  depart_latitude_circuit: number;

  @Column({ nullable: false })
  img: string;

  @Column({ nullable: true })
  video: string;

  // Relation avec Destination (Many-to-One)
  @ManyToOne(() => Destination, (destination) => destination.circuits, {
    nullable: true,
  })
  @JoinColumn({ name: 'destination_id' })
  destination: Destination;

  // Relation avec Monument via CircuitMonument (One-to-Many)
  @OneToMany(
    () => CircuitMonument,
    (circuitMonument) => circuitMonument.circuit,
  )
  circuitMonuments: CircuitMonument[];

  // Relation avec Pack (One-to-Many)
  @OneToMany(() => Pack, (pack) => pack.circuit)
  packs: Pack[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
