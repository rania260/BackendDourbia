// photo.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Photo } from './photo.entity';
import { PhotoService } from './Photo.Service';


@Module({
  imports: [TypeOrmModule.forFeature([Photo])],
  providers: [PhotoService],
  exports: [PhotoService],  // <-- très important : exporter le service
})
export class PhotoModule {}
