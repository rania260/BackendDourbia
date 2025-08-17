import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { DestinationService } from './destination.service';
import { DestinationController } from './destination.controller';
import { Destination } from './entities/destination.entity';
import { Circuit } from '../circuit/entities/circuit.entity';
import { PhotoModule } from '../photo/photo.module';
import { CloudinaryService } from './cloudinary.service';
import { multerDestinationOptions } from './multer.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Destination, Circuit]),
    MulterModule.register(multerDestinationOptions),
    PhotoModule, // Importer PhotoModule pour utiliser PhotoService
  ],
  controllers: [DestinationController],
  providers: [DestinationService, CloudinaryService], // Ajouter CloudinaryService
})
export class DestinationModule {}
