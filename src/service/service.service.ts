import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { Service } from './entities/service.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { USERROLES } from 'src/utils/enum';
import { PhotoService } from '../photo/Photo.Service';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private photoService: PhotoService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createServiceDto: CreateServiceDto,
    partnerId: number,
  ): Promise<Service> {
    const partner = await this.userRepository.findOne({
      where: { id: partnerId, role: USERROLES.PARTNER },
    });

    if (!partner) {
      throw new NotFoundException('Partenaire non trouvé');
    }

    const service = this.serviceRepository.create({
      ...createServiceDto,
      partner,
    });

    return this.serviceRepository.save(service);
  }

  async findAll(): Promise<Service[]> {
    try {
      return await this.serviceRepository.find({
        relations: ['partner'],
        order: {
          id: 'DESC',
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch services: ${error.message}`,
      );
    }
  }

  async findByPartnerId(partnerId: string): Promise<Service[]> {
    try {
      return await this.serviceRepository.find({
        where: { partner: { id: parseInt(partnerId) } },
        relations: ['partner'],
        order: {
          id: 'DESC',
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch partner services: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<Service> {
    try {
      const service = await this.serviceRepository.findOne({
        where: { id },
        relations: ['partner'],
      });

      if (!service) {
        throw new NotFoundException('Service not found');
      }

      return service;
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch service: ${error.message}`,
      );
    }
  }

  async update(id: string, updateDto: CreateServiceDto): Promise<Service> {
    try {
      const service = await this.serviceRepository.findOne({
        where: { id },
        relations: ['partner'],
      });

      if (!service) {
        throw new NotFoundException('Service not found');
      }

      // Update other fields
      Object.assign(service, updateDto);

      return await this.serviceRepository.save(service);
    } catch (error) {
      throw new BadRequestException(
        `Failed to update service: ${error.message}`,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.serviceRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException('Service not found');
      }
    } catch (error) {
      throw new BadRequestException(
        `Failed to delete service: ${error.message}`,
      );
    }
  }

  // =============== MÉTHODES DE GESTION DES PHOTOS ===============

  // Méthode utilitaire pour convertir UUID en nombre
  private convertUUIDToNumber(uuid: string): number {
    // Créer un hash simple à partir de l'UUID
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
      const char = uuid.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  async addPhoto(serviceId: string, file: Express.Multer.File): Promise<any> {
    try {
      // Vérifier que le service existe
      const service = await this.serviceRepository.findOne({
        where: { id: serviceId },
      });

      if (!service) {
        throw new NotFoundException('Service not found');
      }

      // Upload vers Cloudinary
      const imageUrl = await this.cloudinaryService.uploadImage(
        file,
        'services',
      );

      // Sauvegarder dans la base de données
      // Convertir l'UUID en hash numérique pour compatibilité
      const numericId = this.convertUUIDToNumber(serviceId);
      const photo = await this.photoService.addPhoto('service', numericId, imageUrl);

      return photo;
    } catch (error) {
      throw new BadRequestException(`Failed to add photo: ${error.message}`);
    }
  }

  async getPhotos(serviceId: string): Promise<any[]> {
    try {
      const numericId = this.convertUUIDToNumber(serviceId);
      return await this.photoService.getPhotos('service', numericId);
    } catch (error) {
      throw new BadRequestException(`Failed to get photos: ${error.message}`);
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
      throw new BadRequestException(`Failed to delete photo: ${error.message}`);
    }
  }
}
