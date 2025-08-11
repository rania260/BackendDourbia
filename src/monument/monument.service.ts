// src/monument/monument.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { Monument } from './entities/monument.entity';
import { CreateMonumentDto } from './dto/create-monument.dto';
import { UpdateMonumentDto } from './dto/update-monument.dto';

@Injectable()
export class MonumentService {
  constructor(
    @InjectRepository(Monument)
    private monumentRepository: Repository<Monument>,
  ) {}

  async create(createDto: CreateMonumentDto, file?: Express.Multer.File): Promise<Monument> {
    const monumentData = { ...createDto };
    
    if (file) {
      monumentData.image_panoramique = file.filename;
    }

    const monument = this.monumentRepository.create(monumentData);
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

  async update(id: number, updateDto: UpdateMonumentDto, file?: Express.Multer.File): Promise<Monument> {
    const existingMonument = await this.findOne(id);
    const updateData = { ...updateDto };
    
    if (file) {
      // Supprimer l'ancienne image si elle existe
      if (existingMonument.image_panoramique) {
        const oldImagePath = path.join('./uploads/monuments', existingMonument.image_panoramique);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.image_panoramique = file.filename;
    }
    
    await this.monumentRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const monument = await this.findOne(id);
    
    // Supprimer l'image associée si elle existe
    if (monument.image_panoramique) {
      const imagePath = path.join('./uploads/monuments', monument.image_panoramique);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await this.monumentRepository.remove(monument);
  }

  getImage(filename: string, res: Response): void {
    const imagePath = path.join('./uploads/monuments', filename);
    
    if (!fs.existsSync(imagePath)) {
      throw new NotFoundException('Image not found');
    }
    
    res.sendFile(path.resolve(imagePath));
  }
}
