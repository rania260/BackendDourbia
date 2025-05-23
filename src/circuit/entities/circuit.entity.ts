import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}