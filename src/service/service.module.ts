import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { Service } from './entities/service.entity';
import { User } from '../auth/entities/user.entity';
import { PhotoModule } from '../photo/photo.module';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, User]),
    PhotoModule,
  ],
  controllers: [ServiceController],
  providers: [ServiceService, CloudinaryService],
  exports: [ServiceService],
})
export class ServiceModule {}
