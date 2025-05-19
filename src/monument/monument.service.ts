// src/monument/monument.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Monument } from './entities/monument.entity';
import { CreateMonumentDto } from './dto/create-monument.dto';
import { UpdateMonumentDto } from './dto/update-monument.dto';

@Injectable()
export class MonumentService {
  constructor(
    @InjectRepository(Monument)
    private monumentRepository: Repository<Monument>,
  ) {}

  async create(createDto: CreateMonumentDto): Promise<Monument> {
    const monument = this.monumentRepository.create(createDto);
    return this.monumentRepository.save(monument);
  }

  async findAll(): Promise<Monument[]> {
    return this.monumentRepository.find();
  }

  async findOne(id: number): Promise<Monument> {
    const monument = await this.monumentRepository.findOne({ where: { id } });
    if (!monument) throw new NotFoundException('Monument not found');
    return monument;
  }

  async update(id: number, updateDto: UpdateMonumentDto): Promise<Monument> {
    await this.findOne(id); 
    await this.monumentRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const monument = await this.findOne(id);
    await this.monumentRepository.remove(monument);
  }
}
