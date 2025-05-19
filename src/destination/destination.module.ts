import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DestinationService } from './destination.service';
import { DestinationController } from './destination.controller';
import { Destination } from './entities/destination.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Destination])],
  controllers: [DestinationController],
  providers: [DestinationService],
})
export class DestinationModule {}
