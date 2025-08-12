import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Circuit } from '../../circuit/entities/circuit.entity';
import { Monument } from '../../monument/entities/monument.entity';

@Entity('circuit_monument')
@Unique(['circuit', 'ordre']) // Un ordre ne peut être qu'une fois par circuit
export class CircuitMonument {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Circuit, (circuit) => circuit.circuitMonuments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'circuit_id' })
  circuit: Circuit;

  @ManyToOne(() => Monument, (monument) => monument.circuitMonuments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'monument_id' })
  monument: Monument;

  @Column({ type: 'int' })
  ordre: number;
}
