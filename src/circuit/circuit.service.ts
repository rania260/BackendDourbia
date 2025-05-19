import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Circuit } from './entities/circuit.entity';
import { CreateCircuitDto } from './dto/create-circuit.dto';
import { UpdateCircuitDto } from './dto/update-circuit.dto';

@Injectable()
export class CircuitService {
  constructor(
    @InjectRepository(Circuit)
    private readonly circuitRepository: Repository<Circuit>,
  ) {}

  async create(createDto: CreateCircuitDto): Promise<Circuit> {
    const circuit = this.circuitRepository.create(createDto);
    return await this.circuitRepository.save(circuit);
  }

  async findAll(): Promise<Circuit[]> {
    return await this.circuitRepository.find();
  }

  async findOne(id: number): Promise<Circuit | null> {
    return await this.circuitRepository.findOneBy({ id });
  }

  async update(id: number, updateDto: UpdateCircuitDto): Promise<Circuit | null> {
    const circuit = await this.circuitRepository.preload({
      id,
      ...updateDto,
    });
    if (!circuit) return null;
    return await this.circuitRepository.save(circuit);
  }

  async remove(id: number): Promise<Circuit | null> {
    const circuit = await this.findOne(id);
    if (!circuit) return null;
    return await this.circuitRepository.remove(circuit);
  }
}
