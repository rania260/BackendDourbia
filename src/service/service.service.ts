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

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
}
