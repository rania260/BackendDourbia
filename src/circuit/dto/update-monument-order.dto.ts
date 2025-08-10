import { IsNumber } from 'class-validator';

export class UpdateMonumentOrderDto {
  @IsNumber()
  circuitId: number;

  @IsNumber()
  monumentId: number;

  @IsNumber()
  newOrder: number;
}
