import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsUUID,
} from 'class-validator';

export class CreatePackDto {
  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  prix: number;

  @IsNotEmpty()
  @IsNumber()
  circuitId: number;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  serviceIds?: string[];
}
