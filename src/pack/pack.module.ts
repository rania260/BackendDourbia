import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackService } from './pack.service';
import { PackController } from './pack.controller';
import { Pack } from './entities/pack.entity';
import { Circuit } from '../circuit/entities/circuit.entity';
import { Service } from '../service/entities/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pack, Circuit, Service])],
  controllers: [PackController],
  providers: [PackService],
  exports: [PackService],
})
export class PackModule {}
