import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonumentService } from './monument.service';
import { MonumentController } from './monument.controller';
import { Monument } from './entities/monument.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Monument])],
  controllers: [MonumentController],
  providers: [MonumentService],
})
export class MonumentModule {}
