import { Module } from '@nestjs/common';
import { MonumentService } from './monument.service';
import { MonumentController } from './monument.controller';

@Module({
  controllers: [MonumentController],
  providers: [MonumentService],
})
export class MonumentModule {}
