import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { Service } from './entities/service.entity';
import { Partner } from '../partner/partner.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, Partner])
  ],
  controllers: [ServiceController],
  providers: [ServiceService],
})
export class ServiceModule {}
