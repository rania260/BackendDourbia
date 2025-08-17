// src/audio/audio.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('audio')
export class Audio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string; // Lien vers le fichier audio sur Cloudinary

  @Column()
  entityType: string; // Type de l'entité associée (ex: "monument")

  @Column()
  entityId: number; // ID de l'entité associée
}
