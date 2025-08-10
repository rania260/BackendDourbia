import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Contribution } from 'src/contribution/entities/contribution.entity';
import { CircuitMonument } from '../../circuit/entities/circuit-monument.entity';

@Entity()
export class Monument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom_monument_FR: string;

  @Column()
  nom_monument_EN: string;

  @Column()
  nom_monument_AR: string;

  @Column({ nullable: true })
  priorité: number;

  @Column({ nullable: true })
  latitude_monument: string;

  @Column({ nullable: true })
  longitude_monument: string;

  @Column({ nullable: true })
  statut_monument: string;

  @Column({ nullable: true })
  importance_monument: string;

  @Column({ nullable: true })
  accessibilite_monument: string;

  @Column({ nullable: true })
  relief: string;

  @Column({ nullable: true })
  adresse_monument: string;

  @Column({ nullable: true })
  description_FR: string;

  @Column({ nullable: true })
  description_EN: string;

  @Column({ nullable: true })
  description_AR: string;

  @Column({ nullable: true })
  Affect: string;

  @Column({ nullable: true })
  etat_conservation: string;

  @Column({ nullable: true })
  duree_visite: number;

  @Column({ nullable: true })
  horaire_ouverture_ete: string;

  @Column({ nullable: true })
  horaire_fermeture_ete: string;

  @Column({ nullable: true })
  horaire_ouverture_hiver: string;

  @Column({ nullable: true })
  horaire_fermeture_hiver: string;

  @Column({ nullable: true })
  telephone_site: string;

  @Column({ nullable: true })
  epoque_dominante: string;

  @Column({ nullable: true })
  epoque_moins_visible: string;

  @Column({ nullable: true })
  troisieme_epoque: string;

  @Column({ nullable: true })
  fonction_monument: string;

  @Column({ nullable: true })
  image_panoramique: string;

  @Column({ nullable: true })
  modele_obj: string;

  @Column({ nullable: true })
  url_video_FR: string;

  @Column({ nullable: true })
  uri_video_EN: string;

  @Column({ nullable: true })
  uri_video_AR: string;

  @Column({ nullable: true })
  lien_video_360: string;

  @Column({ nullable: true })
  lien_video_3D: string;

  @Column({ nullable: true })
  enregistrement_audio_FR: string;

  @Column({ nullable: true })
  enregistrement_audio_EN: string;

  @Column({ nullable: true })
  enregistrement_audio_AR: string;

  // Relation avec Contribution (existante)
  @OneToMany(() => Contribution, (contribution) => contribution.monument)
  contributions: Contribution[];

  // Relation avec Circuit via CircuitMonument (Many-to-Many)
  @OneToMany(
    () => CircuitMonument,
    (circuitMonument) => circuitMonument.monument,
  )
  circuitMonuments: CircuitMonument[];
}
