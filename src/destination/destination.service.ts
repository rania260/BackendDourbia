import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { AssignCircuitsToDestinationDto } from './dto/assign-circuits-to-destination.dto';
import { Destination } from './entities/destination.entity';
import { Circuit } from '../circuit/entities/circuit.entity';
import { PhotoService } from '../photo/Photo.Service';

@Injectable()
export class DestinationService {
  constructor(
    @InjectRepository(Destination)
    private readonly destinationRepository: Repository<Destination>,
    @InjectRepository(Circuit)
    private readonly circuitRepository: Repository<Circuit>,
    private readonly photoService: PhotoService, // Injection PhotoService
  ) {}

  async create(createDto: CreateDestinationDto, image?: Express.Multer.File): Promise<Destination> {
    const destination = this.destinationRepository.create({
      ...createDto,
      image: image ? image.filename : createDto.image, // Utilise le nom du fichier uploadé ou l'URL fournie
    });
    return await this.destinationRepository.save(destination);
  }

  async findAll(): Promise<Destination[]> {
    const destinations = await this.destinationRepository.find({
      relations: ['circuits'],
    });
    
    // Ajouter les photos pour chaque destination
    for (const destination of destinations) {
      destination['photos'] = await this.photoService.getPhotos('destination', destination.id);
    }
    
    return destinations;
  }

  async findOne(id: number): Promise<Destination | null> {
    const destination = await this.destinationRepository.findOne({
      where: { id },
      relations: ['circuits'],
    });
    
    if (destination) {
      // Ajouter les photos
      destination['photos'] = await this.photoService.getPhotos('destination', destination.id);
    }
    
    return destination;
  }

  async update(id: number, updateDto: UpdateDestinationDto): Promise<Destination | null> {
    const destination = await this.destinationRepository.preload({
      id,
      ...updateDto,
    });
    if (!destination) return null;
    return await this.destinationRepository.save(destination);
  }

  async remove(id: number): Promise<Destination | null> {
    const destination = await this.findOne(id);
    if (!destination) return null;
    return await this.destinationRepository.remove(destination);
  }

  async assignCircuits(
    destinationId: number,
    assignDto: AssignCircuitsToDestinationDto,
  ): Promise<Destination | null> {
    const destination = await this.findOne(destinationId);
    if (!destination) return null;

    // Retirer la destination de tous les circuits actuels de cette destination
    await this.circuitRepository.query(
      'UPDATE circuit SET destination_id = NULL WHERE destination_id = $1',
      [destinationId]
    );

    // Assigner la nouvelle destination aux circuits sélectionnés
    if (assignDto.circuitIds.length > 0) {
      const placeholders = assignDto.circuitIds.map((_, index) => `$${index + 2}`).join(',');
      await this.circuitRepository.query(
        `UPDATE circuit SET destination_id = $1 WHERE id IN (${placeholders})`,
        [destinationId, ...assignDto.circuitIds]
      );
    }

    return await this.findOne(destinationId);
  }

  async getAvailableCircuits(): Promise<Circuit[]> {
    return await this.circuitRepository.find({
      relations: ['destination'],
    });
  }

  // === NOUVELLES MÉTHODES POUR GÉRER LES PHOTOS ===
  
  async addPhoto(destinationId: number, photoUrl: string): Promise<any> {
    return await this.photoService.addPhoto('destination', destinationId, photoUrl);
  }

  async getPhotos(destinationId: number): Promise<any[]> {
    return await this.photoService.getPhotos('destination', destinationId);
  }

  async deletePhoto(photoId: number): Promise<void> {
    return await this.photoService.deletePhoto(photoId);
  }

  async deleteAllPhotos(destinationId: number): Promise<void> {
    return await this.photoService.deletePhotosByEntity('destination', destinationId);
  }
}
