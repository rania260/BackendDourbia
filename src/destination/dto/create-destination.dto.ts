import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDestinationDto {
  @IsNotEmpty()
  nom: string;

  @IsNotEmpty()
  description: string;

  @IsOptional()
  image: string;

  @IsOptional()
  adresse: string;

  @IsOptional()
  code_postal: string;

  @IsOptional()
  ville: string;

  @IsOptional()
  telephone: string;

  @IsOptional()
  email: string;

  @IsOptional()
  site_web: string;

  @IsOptional()
  geom: string;
}
