import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CircuitService } from './circuit.service';
import { CircuitController } from './circuit.controller';
import { Circuit } from './entities/circuit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Circuit])],
  controllers: [CircuitController],
  providers: [CircuitService],
})
export class CircuitModule {}
