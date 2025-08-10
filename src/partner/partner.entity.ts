import { Entity, Column, OneToMany, ChildEntity } from 'typeorm';

import { Service } from 'src/service/entities/service.entity';
import { User } from 'src/auth/entities/user.entity';
@ChildEntity()
@Entity('partners')
export class Partner extends User{

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