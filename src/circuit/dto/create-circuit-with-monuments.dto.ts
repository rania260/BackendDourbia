import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MonumentInCircuitDto {
  @IsNumber()
  monumentId: number;

  @IsNumber()
  ordre: number;
}

export class CreateCircuitWithMonumentsDto {
  @IsString()
  @IsNotEmpty()
  nom_circuit: string;

  @IsString()
  @IsNotEmpty()
  description_thematique: string;

  @IsNumber()
  nbr_etape: number;

  @IsNumber()
  kilometrage: number;

  @IsNumber()
  duree_heures: number;

  @IsNumber()
  duree_minutes: number;

  @IsNumber()
  depart_longitude_circuit: number;

  @IsNumber()
  depart_latitude_circuit: number;

  @IsString()
  @IsNotEmpty()
  img: string;

  @IsString()
  @IsOptional()
  video?: string;

  @IsNumber()
  @IsOptional()
  destinationId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MonumentInCircuitDto)
  monuments: MonumentInCircuitDto[];
}
