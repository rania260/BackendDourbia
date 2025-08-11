import { IsArray, IsNumber } from 'class-validator';

export class AssignCircuitsToDestinationDto {
  @IsArray()
  @IsNumber({}, { each: true })
  circuitIds: number[];
}
