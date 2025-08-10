import { Entity, Column, ChildEntity } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@ChildEntity()
@Entity('experts')
export class Expert extends User {
  @Column({ type: 'simple-array', default: [] })
  specialities: string[]; // ['archéologue', 'historien', ...]

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array', default: [] })
  epochs: string[]; // ['punique', 'romaine', 'byzantine', 'beylicale', 'coloniale', ...]
}
