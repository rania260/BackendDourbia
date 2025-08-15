import { IsNumber, IsOptional, Min } from 'class-validator';

export class StripePaymentDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  packId: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantite?: number = 1;
}
