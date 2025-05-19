import { PartialType } from '@nestjs/swagger';
import { CreateMonumentDto } from './create-monument.dto';

export class UpdateMonumentDto extends PartialType(CreateMonumentDto) {}
