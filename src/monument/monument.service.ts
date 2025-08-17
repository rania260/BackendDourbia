// src/monument/monument.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { Monument } from './entities/monument.entity';
import { CreateMonumentDto } from './dto/create-monument.dto';
import { UpdateMonumentDto } from './dto/update-monument.dto';
import { PhotoService } from '../photo/Photo.Service';
import { AudioService } from '../audio/audio.service';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class MonumentService {
  constructor(
    @InjectRepository(Monument)
    private monumentRepository: Repository<Monument>,
    private photoService: PhotoService,
    private audioService: AudioService,
    private cloudinaryService: CloudinaryService,
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
    return this.monumentRepository.find({
      relations: ['circuitMonuments', 'circuitMonuments.circuit'],
    });
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
    
    // Supprimer les fichiers audio associés s'ils existent
    const audioFiles = [
      monument.enregistrement_audio_FR,
      monument.enregistrement_audio_EN,
      monument.enregistrement_audio_AR,
    ].filter(Boolean);
    
    audioFiles.forEach((audioFile) => {
      const audioPath = path.join('./uploads/monuments/audio', audioFile);
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    });
    
    await this.monumentRepository.remove(monument);
  }

  getImage(filename: string, res: Response): void {
    const imagePath = path.join('./uploads/monuments', filename);
    
    if (!fs.existsSync(imagePath)) {
      throw new NotFoundException('Image not found');
    }
    
    res.sendFile(path.resolve(imagePath));
  }

  async uploadAudio(
    id: number,
    language: string,
    file: Express.Multer.File,
  ): Promise<Monument> {
    const monument = await this.findOne(id);
    
    // Définir le champ audio selon la langue
    let currentAudioFile: string | undefined;
    
    if (language === 'FR') {
      currentAudioFile = monument.enregistrement_audio_FR;
    } else if (language === 'EN') {
      currentAudioFile = monument.enregistrement_audio_EN;
    } else if (language === 'AR') {
      currentAudioFile = monument.enregistrement_audio_AR;
    }
    
    // Supprimer l'ancien fichier audio s'il existe
    if (currentAudioFile) {
      const oldAudioPath = path.join(
        './uploads/monuments/audio',
        currentAudioFile,
      );
      if (fs.existsSync(oldAudioPath)) {
        fs.unlinkSync(oldAudioPath);
      }
    }
    
    // Mettre à jour avec le nouveau fichier
    const updateData: Partial<Monument> = {};
    
    if (language === 'FR') {
      updateData.enregistrement_audio_FR = file.filename;
    } else if (language === 'EN') {
      updateData.enregistrement_audio_EN = file.filename;
    } else if (language === 'AR') {
      updateData.enregistrement_audio_AR = file.filename;
    }
    
    await this.monumentRepository.update(id, updateData);
    return this.findOne(id);
  }

  getAudio(filename: string, res: Response): void {
    const audioPath = path.join('./uploads/monuments/audio', filename);
    
    if (!fs.existsSync(audioPath)) {
      throw new NotFoundException('Audio file not found');
    }
    
    res.sendFile(path.resolve(audioPath));
  }

  // =============== MÉTHODES DE GESTION DES PHOTOS ===============

  async addPhoto(monumentId: number, file: Express.Multer.File): Promise<any> {
    try {
      // Vérifier que le monument existe
      const monument = await this.monumentRepository.findOne({
        where: { id: monumentId },
      });

      if (!monument) {
        throw new NotFoundException('Monument not found');
      }

      // Upload vers Cloudinary
      const imageUrl = await this.cloudinaryService.uploadImage(
        file,
        'monuments',
      );

      // Sauvegarder dans la base de données
      const photo = await this.photoService.addPhoto('monument', monumentId, imageUrl);

      return photo;
    } catch (error) {
      throw new BadRequestException(`Failed to add photo: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  async getPhotos(monumentId: number): Promise<any[]> {
    try {
      return await this.photoService.getPhotos('monument', monumentId);
    } catch (error) {
      throw new BadRequestException(`Failed to get photos: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  async deletePhoto(photoId: number): Promise<void> {
    try {
      // Récupérer la photo pour obtenir l'URL
      const photo = await this.photoService.getPhotoById(photoId);
      
      if (!photo) {
        throw new NotFoundException('Photo not found');
      }

      // Supprimer de Cloudinary
      const publicId = this.cloudinaryService.extractPublicId(photo.url);
      await this.cloudinaryService.deleteImage(publicId);

      // Supprimer de la base de données
      await this.photoService.deletePhoto(photoId);
    } catch (error) {
      throw new BadRequestException(`Failed to delete photo: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  // =============== MÉTHODES DE GESTION DES AUDIOS ===============

  async addAudio(monumentId: number, file: Express.Multer.File, language: string): Promise<any> {
    try {
      // Vérifier que le monument existe
      const monument = await this.monumentRepository.findOne({
        where: { id: monumentId },
      });

      if (!monument) {
        throw new NotFoundException('Monument not found');
      }

      // Upload vers Cloudinary
      const audioUrl = await this.cloudinaryService.uploadAudio(
        file,
        `monuments/audio/${language}`,
      );

      // Sauvegarder dans la base de données
      const audio = await this.audioService.addAudio('monument', monumentId, audioUrl);

      return audio;
    } catch (error) {
      throw new BadRequestException(`Failed to add audio: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  async getAudios(monumentId: number): Promise<any[]> {
    try {
      return await this.audioService.getAudios('monument', monumentId);
    } catch (error) {
      throw new BadRequestException(`Failed to get audios: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  async deleteAudio(audioId: number): Promise<void> {
    try {
      // Récupérer l'audio pour obtenir l'URL
      const audio = await this.audioService.getAudioById(audioId);
      
      if (!audio) {
        throw new NotFoundException('Audio not found');
      }

      // Supprimer de Cloudinary
      const publicId = this.cloudinaryService.extractPublicId(audio.url);
      await this.cloudinaryService.deleteImage(publicId);

      // Supprimer de la base de données
      await this.audioService.deleteAudio(audioId);
    } catch (error) {
      throw new BadRequestException(`Failed to delete audio: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
}
