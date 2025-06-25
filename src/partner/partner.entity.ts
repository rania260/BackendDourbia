import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Service } from 'src/service/entities/service.entity';

@Entity('partners')
export class Partner {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, user => user.partner, { 
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  user: User;

  @Column({ type: 'simple-array', default: [] })
  types: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array', default: [] })
  regions: string[];

  @Column({ type: 'simple-array', default: [] })
  services: string[];
  
  @OneToMany(() => Service, (service) => service.partner, { cascade: true })
  servicesList: Service[];
}