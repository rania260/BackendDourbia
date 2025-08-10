import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Circuit } from '../../circuit/entities/circuit.entity';

@Entity()
export class Destination {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  nom: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false })
  image: string;

  @Column({ nullable: true })
  adresse: string;

  @Column({ nullable: true })
  code_postal: string;

  @Column({ nullable: true })
  ville: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  site_web: string;

  // Relation avec Circuit (One-to-Many)
  @OneToMany(() => Circuit, (circuit) => circuit.destination)
  circuits: Circuit[];
}
