import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { CircuitService } from './circuit.service';
import { CircuitController } from './circuit.controller';
import { Circuit } from './entities/circuit.entity';
import { CircuitMonument } from './entities/circuit-monument.entity';
import { Monument } from '../monument/entities/monument.entity';
import { Destination } from '../destination/entities/destination.entity';
import { multerCircuitOptions } from './multer.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Circuit, CircuitMonument, Monument, Destination]),
    MulterModule.register(multerCircuitOptions),
  ],
  controllers: [CircuitController],
  providers: [CircuitService],
  exports: [CircuitService],
})
export class CircuitModule {}
