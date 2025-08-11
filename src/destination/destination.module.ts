import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { DestinationService } from './destination.service';
import { DestinationController } from './destination.controller';
import { Destination } from './entities/destination.entity';
import { multerDestinationOptions } from './multer.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Destination]),
    MulterModule.register(multerDestinationOptions),
  ],
  controllers: [DestinationController],
  providers: [DestinationService],
})
export class DestinationModule {}
