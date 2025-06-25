import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Partner } from './partner.entity';
import { User } from '../auth/entities/user.entity';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { USERROLES } from '../utils/enum';

@Injectable()
export class PartnerService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
  ) {}

  // CREATE Partner
  async createPartner(createPartnerDto: CreatePartnerDto): Promise<{ user: User; partner: Partner }> {
    const { email, username, password, country, region, types, description, regions, services } = createPartnerDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
      avatar: '',
      country,
      region,
      phone: '',
      role: USERROLES.PARTENAIRE,
    });

    const savedUser = await this.userRepository.save(user);

    const partner = this.partnerRepository.create({
      user: savedUser,
      types,
      description,
      regions: regions || [],
      services: services || [],
    });

    await this.partnerRepository.save(partner);

    return { user: savedUser, partner };
  }

// GET ALL Partners
// async findAllPartners(): Promise<any[]> {
//   const users = await this.userRepository.find({
//     relations: ['partner'], // Charger explicitement la relation partner
//     where: { role: USERROLES.PARTENAIRE },
//   });

//   return users.map(user => ({
//     id: user.id,
//     username: user.username,
//     email: user.email,
//     avatar: user.avatar,
//     phone: user.phone,
//     country: user.country,
//     region: user.region,
//     emailVerifiedAt: user.emailVerifiedAt,
//     isBanned: user.isBanned,
//     role: user.role,
//     types: user.partner?.types || [],
//     description: user.partner?.description || null, // Utiliser null au lieu de chaîne vide
//     regions: user.partner?.regions || [],
//     services: user.partner?.services || [],
//   }));
// }
async findAllPartners(): Promise<any[]> {
  const partners = await this.partnerRepository.find({
    relations: ['user'], // Chargez la relation user
  });

  return partners.map(partner => ({
    id: partner.user.id,
    username: partner.user.username,
    email: partner.user.email,
    avatar: partner.user.avatar,
    phone: partner.user.phone,
    country: partner.user.country,
    region: partner.user.region,
    emailVerifiedAt: partner.user.emailVerifiedAt,
    isBanned: partner.user.isBanned,
    role: partner.user.role,
    types: partner.types,
    description: partner.description,
    regions: partner.regions,
    services: partner.services,
  }));
}

  // UPDATE Partner
  async updatePartner(id: number, updatePartnerDto: UpdatePartnerDto): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id }, relations: { partner: true } });

    if (!user || user.role !== USERROLES.PARTENAIRE) {
      throw new NotFoundException('Partner not found');
    }

    const { username, email, country, region, phone, types, description, regions, services } = updatePartnerDto;

    // Update User fields
    user.username = username ?? user.username;
    user.email = email ?? user.email;
    user.country = country ?? user.country;
    user.region = region ?? user.region;
    user.phone = phone ?? user.phone;

    await this.userRepository.save(user);

    // Update Partner fields
    if (user.partner) {
      user.partner.types = types ?? user.partner.types;
      user.partner.description = description ?? user.partner.description;
      user.partner.regions = regions ?? user.partner.regions;
      user.partner.services = services ?? user.partner.services;

      await this.partnerRepository.save(user.partner);
    }

    return { message: 'Partner updated successfully' };
  }

  // DELETE Partner
  async deletePartner(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id }, relations: { partner: true } });

    if (!user || user.role !== USERROLES.PARTENAIRE) {
      throw new NotFoundException('Partner not found');
    }

    if (user.partner) {
      await this.partnerRepository.delete(user.partner.id);
    }

    await this.userRepository.delete(id);

    return { message: 'Partner deleted successfully' };
  }
}
