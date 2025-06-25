import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFeedbackDto {
  @IsNotEmpty()
  @IsString()
  emoji: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}
