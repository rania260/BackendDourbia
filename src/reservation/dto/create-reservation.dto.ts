import { IsInt, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({ description: 'ID de l\'utilisateur', example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ description: 'ID du pack achete', example: 1 })
  @IsInt()
  packPurchaseId: number;

  @ApiProperty({ description: 'ID du service', example: '1ddf0eb8-f05f-450d-bb4d-ba9ac498031a' })
  @IsString()
  serviceId: string;

  @ApiPropertyOptional({ description: 'Date de reservation ISO', example: '2025-08-10T14:00:00Z' })
  @IsOptional()
  @IsDateString()
  dateReservation?: string;

  @ApiPropertyOptional({ description: 'Heure de fin format HH:mm', example: '16:30' })
  @IsOptional()
  @IsString()
  heureFin?: string;

  @ApiPropertyOptional({ description: 'Quantite reservee', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantite?: number;

  @ApiPropertyOptional({ description: 'Remarque', example: 'Besoin d\'aide speciale' })
  @IsOptional()
  @IsString()
  remarque?: string;
}
