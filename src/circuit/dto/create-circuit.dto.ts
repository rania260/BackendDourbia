import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCircuitDto {
  @IsNotEmpty()
  @IsString()
  nom_circuit: string;

  @IsNotEmpty()
  @IsString()
  description_thematique: string;

  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const num = parseFloat(value.replace(',', '.'));
      return isNaN(num) ? 0 : num;
    }
    return value;
  })
  @IsNumber()
  nbr_etape: number;

  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const num = parseFloat(value.replace(',', '.'));
      return isNaN(num) ? 0 : num;
    }
    return value;
  })
  @IsNumber()
  kilometrage: number;

  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const num = parseFloat(value.replace(',', '.'));
      return isNaN(num) ? 0 : num;
    }
    return value;
  })
  @IsNumber()
  duree_heures: number;

  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const num = parseFloat(value.replace(',', '.'));
      return isNaN(num) ? 0 : num;
    }
    return value;
  })
  @IsNumber()
  duree_minutes: number;

  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const num = parseFloat(value.replace(',', '.'));
      return isNaN(num) ? 0 : num;
    }
    return value;
  })
  @IsNumber()
  depart_longitude_circuit: number;

  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const num = parseFloat(value.replace(',', '.'));
      return isNaN(num) ? 0 : num;
    }
    return value;
  })
  @IsNumber()
  depart_latitude_circuit: number;

  @IsOptional()
  @IsString()
  img?: string;

  @IsOptional()
  @IsString()
  video?: string;
}
