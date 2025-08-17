// src/audio/audio.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Audio } from './audio.entity';

@Injectable()
export class AudioService {
  constructor(
    @InjectRepository(Audio)
    private audioRepository: Repository<Audio>,
  ) {}

  // Ajouter un audio
  async addAudio(entityType: string, entityId: number, url: string) {
    const audio = new Audio();
    audio.entityType = entityType;
    audio.entityId = entityId;
    audio.url = url;
    return this.audioRepository.save(audio);
  }

  // Récupérer les audios d'une entité
  async getAudios(entityType: string, entityId: number): Promise<Audio[]> {
    return this.audioRepository.find({ where: { entityType, entityId } });
  }

  // Récupérer les audios de plusieurs entités
  async getAudiosByEntityIds(entityType: string, entityIds: number[]): Promise<Audio[]> {
    if (entityIds.length === 0) return [];
    return this.audioRepository.find({
      where: {
        entityType,
        entityId: In(entityIds),
      },
    });
  }

  // Récupérer un audio par ID
  async getAudioById(id: number): Promise<Audio | null> {
    return this.audioRepository.findOne({ where: { id } });
  }

  // Supprimer un audio par ID
  async deleteAudio(id: number): Promise<void> {
    await this.audioRepository.delete(id);
  }

  // Supprimer tous les audios d'une entité
  async deleteAudiosByEntity(entityType: string, entityId: number): Promise<void> {
    await this.audioRepository.delete({ entityType, entityId });
  }
}
