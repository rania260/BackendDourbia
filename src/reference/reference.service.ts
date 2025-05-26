import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reference } from './entities/reference.entity';
import { CreateReferenceDto } from './dto/create-reference.dto';
import { UpdateReferenceDto } from './dto/update-reference.dto';

@Injectable()
export class ReferenceService {
  constructor(
    @InjectRepository(Reference)
    private referenceRepo: Repository<Reference>,
  ) {}

  async create(createDto: CreateReferenceDto, logoPath: string): Promise<Reference> {
    const reference = this.referenceRepo.create({ 
      ...createDto, 
      logo: `/uploads/references/${logoPath}` // Stocke le chemin complet
    });
    return await this.referenceRepo.save(reference);
  }

  async findAll(): Promise<Reference[]> {
    return this.referenceRepo.find();
  }

  async findOne(id: number): Promise<Reference | null> {
    return this.referenceRepo.findOneBy({ id });
  }

  async update(id: number, updateDto: UpdateReferenceDto, logoPath?: string): Promise<Reference | null> {
    const ref = await this.referenceRepo.findOneBy({ id });
    if (!ref) return null;

    const updated = Object.assign(ref, updateDto);
    if (logoPath) updated.logo = `/uploads/references/${logoPath}`;

    return this.referenceRepo.save(updated);
  }

  async remove(id: number): Promise<Reference | null> {
    const ref = await this.findOne(id);
    if (!ref) return null;
    return this.referenceRepo.remove(ref);
  }
}