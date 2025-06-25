import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum ContributionType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  PDF = 'pdf',
}

export class CreateContributionDto {
  @ApiProperty({
    enum: ContributionType,
    description: 'Type de la contribution (text, image, video, pdf)',
  })
  @IsEnum(ContributionType)
  type: ContributionType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value)) // transforme string → number
  @IsNumber()
  monumentId?: number;
}
