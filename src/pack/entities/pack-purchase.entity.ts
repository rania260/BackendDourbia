import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  AfterLoad,
} from 'typeorm';
import { Pack } from './pack.entity';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class PackPurchase {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.packPurchases)
  user: User;

  @ManyToOne(() => Pack, (pack) => pack.purchases)
  pack: Pack;

  @OneToMany('Reservation', 'packPurchase')
  reservations: any[];

  @Column({ type: 'int', default: 1 })
  quantite: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  prixTotal: number;

  @CreateDateColumn()
  dateAchat: Date;

  @Column({
    type: 'enum',
    enum: ['en ligne', 'sur place'],
    default: 'sur place',
  })
  typePaiement: 'en ligne' | 'sur place';

  @Column({ default: false })
  isPaid: boolean;

  @Column({ type: 'enum', enum: ['stripe', 'flouci'], nullable: true })
  methodePaiement?: 'stripe' | 'flouci';

  // ID de commande Stripe
  @Column({ name: 'id_commande', type: 'varchar', nullable: true })
  idCommande?: string;

  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  numeroCommande?: string;

  @AfterLoad()
  updatePrixTotal() {
    if (this.pack && this.quantite) {
      this.prixTotal = Number(this.pack.prix) * this.quantite;
    }
  }
}
