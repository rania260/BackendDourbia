import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('photo')
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  entityType: string; 

  @Column()
  entityId: number;   
}
