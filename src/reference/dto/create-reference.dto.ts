// src/reference/dto/create-reference.dto.ts
import { IsNotEmpty } from 'class-validator';

export class CreateReferenceDto {
  @IsNotEmpty()
  nom: string;
}
