import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Photo } from './photo.entity';

@Injectable()
export class PhotoService {
  constructor(
    @InjectRepository(Photo)
    private photoRepository: Repository<Photo>,
  ) {}

  async addPhoto(entityType: string, entityId: number, url: string) {
    const photo = new Photo();
    photo.entityType = entityType;
    photo.entityId = entityId;
    photo.url = url;
    return this.photoRepository.save(photo);
  }

  async getPhotos(entityType: string, entityId: number): Promise<Photo[]> {
    return this.photoRepository.find({ where: { entityType, entityId } });
  }

  // Nouvelle méthode pour récupérer plusieurs photos en fonction d'une liste d'entityIds
  async getPhotosByEntityIds(
    entityType: string,
    entityIds: number[],
  ): Promise<Photo[]> {
    if (entityIds.length === 0) return [];
    return this.photoRepository.find({
      where: {
        entityType,
        entityId: In(entityIds),
      },
    });
  }

  // Supprimer une photo par ID
  async deletePhoto(id: number): Promise<void> {
    await this.photoRepository.delete(id);
  }

  // Supprimer toutes les photos d'une entité
  async deletePhotosByEntity(
    entityType: string,
    entityId: number,
  ): Promise<void> {
    await this.photoRepository.delete({ entityType, entityId });
  }

  // Récupérer une photo par ID
  async getPhotoById(id: number): Promise<Photo | null> {
    return this.photoRepository.findOne({ where: { id } });
  }
}
