import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Service } from '../service/entities/service.entity';
import { PackPurchase } from '../pack/entities/pack-purchase.entity';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Service)
  service: Service;

  @Column({ type: 'timestamp', nullable: true })
  dateReservation: Date;

  @Column({ default: 'en attente' })
  statut: string;

  @Column({ nullable: true })
  remarque: string;

  @Column({ type: 'int', default: 1 })
  quantite: number;

  @ManyToOne(() => PackPurchase)
  packPurchase: PackPurchase;

  @Column({ type: 'timestamp', nullable: true })
  heureFin?: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
