import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { Service } from './entities/service.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner } from 'src/partner/partner.entity';


@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
  ) {}

  async create(createServiceDto: CreateServiceDto, partnerId: string): Promise<Service> {
    const partner = await this.partnerRepository.findOne({
      where: {   id: parseInt(partnerId)  }
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
          id: 'DESC'
        }
      });
    } catch (error) {
      throw new BadRequestException(`Failed to fetch services: ${error.message}`);
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
      throw new BadRequestException(`Failed to fetch service: ${error.message}`);
    }
  }

  async update(id: string, updateDto: CreateServiceDto): Promise<Service> {
    try {
      const service = await this.serviceRepository.findOne({
        where: { id },
        relations: ['partner']
      });

      if (!service) {
        throw new NotFoundException('Service not found');
      }

      // Update partner if provided
      if (updateDto.partnerId) {
        const partner = await this.partnerRepository.findOne({
          where: { id: parseInt(updateDto.partnerId) }
        });

        if (!partner) {
          throw new NotFoundException('Partner not found');
        }
        service.partner = partner;
      }

      // Update other fields
      Object.assign(service, updateDto);

      return await this.serviceRepository.save(service);
    } catch (error) {
      throw new BadRequestException(`Failed to update service: ${error.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.serviceRepository.delete(id);
      
      if (result.affected === 0) {
        throw new NotFoundException('Service not found');
      }
    } catch (error) {
      throw new BadRequestException(`Failed to delete service: ${error.message}`);
    }
  }
}

