import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonumentService } from './monument.service';
import { MonumentController } from './monument.controller';
import { Monument } from './entities/monument.entity';
import { PhotoModule } from '../photo/photo.module';
import { AudioModule } from '../audio/audio.module';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Monument]),
    PhotoModule,
    AudioModule,
  ],
  controllers: [MonumentController],
  providers: [MonumentService, CloudinaryService],
  exports: [MonumentService],
})
export class MonumentModule {}
