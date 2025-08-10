import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { USERROLES } from '../utils/enum';
import { Partner } from './partner.entity';

@Injectable()
export class PartnerService {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
  ) {}

  async createPartner(createPartnerDto: CreatePartnerDto): Promise<Partner> {
    const {
      email,
      username,
      password,
      country,
      region,
      types,
      description,
      regions,
      services,
    } = createPartnerDto;

    const existingPartner = await this.partnerRepository.findOne({
      where: { email },
    });
    if (existingPartner) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const partner = this.partnerRepository.create({
      email,
      username,
      password: hashedPassword,
      avatar: '',
      country,
      region,
      phone: '',
      role: USERROLES.PARTNER,
      types,
      description,
      regions: regions || [],
      services: services || [],
    });

    return await this.partnerRepository.save(partner);
  }

  async findAllPartners(): Promise<Partner[]> {
    return await this.partnerRepository.find();
  }

  async updatePartner(
    id: number,
    updatePartnerDto: UpdatePartnerDto,
  ): Promise<Partner> {
    const partner = await this.partnerRepository.findOne({ where: { id } });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    const {
      username,
      email,
      country,
      region,
      phone,
      types,
      description,
      regions,
      services,
    } = updatePartnerDto;

    partner.username = username ?? partner.username;
    partner.email = email ?? partner.email;
    partner.country = country ?? partner.country;
    partner.region = region ?? partner.region;
    partner.phone = phone ?? partner.phone;
    partner.types = types ?? partner.types;
    partner.description = description ?? partner.description;
    partner.regions = regions ?? partner.regions;
    partner.services = services ?? partner.services;

    return await this.partnerRepository.save(partner);
  }

  async deletePartner(id: number): Promise<void> {
    const partner = await this.partnerRepository.findOne({ where: { id } });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    await this.partnerRepository.delete(id);
  }
}
