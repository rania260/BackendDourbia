import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCircuitDto {
  @IsNotEmpty()
  @IsString()
  nom_circuit: string;

  @IsNotEmpty()
  @IsString()
  description_thematique: string;

  @IsNotEmpty()
  @IsNumber()
  nbr_etape: number;

  @IsNotEmpty()
  @IsNumber()
  kilometrage: number;

  @IsNotEmpty()
  @IsNumber()
  duree_heures: number;

  @IsNotEmpty()
  @IsNumber()
  duree_minutes: number;

  @IsNotEmpty()
  @IsNumber()
  depart_longitude_circuit: number;

  @IsNotEmpty()
  @IsNumber()
  depart_latitude_circuit: number;

  @IsOptional()
  @IsString()
  img?: string;

  @IsOptional()
  @IsString()
  video?: string;
}
