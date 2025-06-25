import { Partner } from 'src/partner/partner.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';


@Entity()
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  service: string;

  @Column()
  type: string;

  @Column()
  description: string;

  @Column("text", { array: true }) 
  regions: string[];

  @Column('float') 
  prix: number;

  @ManyToOne(() => Partner, (partner) => partner.servicesList, { onDelete: 'CASCADE' })
  partner: Partner;
}
