import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMonumentDto {
  @IsString() nom_monument_FR: string;
  @IsString() nom_monument_EN: string;
  @IsString() nom_monument_AR: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    return value;
  })
  priorité?: number;

  @IsOptional() @IsString() latitude_monument?: string;
  @IsOptional() @IsString() longitude_monument?: string;
  @IsOptional() @IsString() statut_monument?: string;
  @IsOptional() @IsString() importance_monument?: string;
  @IsOptional() @IsString() accessibilite_monument?: string;
  @IsOptional() @IsString() relief?: string;
  @IsOptional() @IsString() adresse_monument?: string;
  @IsOptional() @IsString() description_FR?: string;
  @IsOptional() @IsString() description_EN?: string;
  @IsOptional() @IsString() description_AR?: string;
  @IsOptional() @IsString() Affect?: string;
  @IsOptional() @IsString() etat_conservation?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    return value;
  })
  duree_visite?: number;

  @IsOptional() @IsString() horaire_ouverture_ete?: string;
  @IsOptional() @IsString() horaire_fermeture_ete?: string;
  @IsOptional() @IsString() horaire_ouverture_hiver?: string;
  @IsOptional() @IsString() horaire_fermeture_hiver?: string;
  @IsOptional() @IsString() telephone_site?: string;
  @IsOptional() @IsString() epoque_dominante?: string;
  @IsOptional() @IsString() epoque_moins_visible?: string;
  @IsOptional() @IsString() troisieme_epoque?: string;
  @IsOptional() @IsString() fonction_monument?: string;
  @IsOptional() @IsString() image_panoramique?: string;
  @IsOptional() @IsString() modele_obj?: string;
  @IsOptional() @IsString() url_video_FR?: string;
  @IsOptional() @IsString() uri_video_EN?: string;
  @IsOptional() @IsString() uri_video_AR?: string;
  @IsOptional() @IsString() lien_video_360?: string;
  @IsOptional() @IsString() lien_video_3D?: string;
  @IsOptional() @IsString() enregistrement_audio_FR?: string;
  @IsOptional() @IsString() enregistrement_audio_EN?: string;
  @IsOptional() @IsString() enregistrement_audio_AR?: string;
}
