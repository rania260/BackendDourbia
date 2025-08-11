import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Expert } from './entities/expert.entity';
import { CreateExpertDto } from './dto/create-expert.dto';
import { UpdateExpertDto } from './dto/update-expert.dto';
import { USERROLES } from '../utils/enum';

@Injectable()
export class ExpertService {
  constructor(
    @InjectRepository(Expert)
    private readonly expertRepository: Repository<Expert>,
  ) {}

  async createExpert(createExpertDto: CreateExpertDto): Promise<Expert> {
    const {
      email,
      username,
      password,
      country,
      region,
      specialities,
      description,
      epochs,
    } = createExpertDto;

    // Vérifier si l'email existe déjà
    const existingExpert = await this.expertRepository.findOne({
      where: { email },
    });
    if (existingExpert) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const expert = this.expertRepository.create({
      email,
      username,
      password: hashedPassword,
      avatar: '',
      country,
      region,
      phone: '',
      role: USERROLES.EXPERT,
      specialities,
      description,
      epochs,
    });

    return await this.expertRepository.save(expert);
  }

  async findAllExperts(): Promise<Expert[]> {
    return await this.expertRepository.find({
      select: [
        'id',
        'username',
        'email',
        'avatar',
        'phone',
        'country',
        'region',
        'emailVerifiedAt',
        'isBanned',
        'role',
        'specialities',
        'description',
        'epochs',
      ],
    });
  }

  async searchExperts(searchTerm: string): Promise<Expert[]> {
    return await this.expertRepository
      .createQueryBuilder('expert')
      .select([
        'expert.id',
        'expert.username',
        'expert.email',
        'expert.avatar',
        'expert.phone',
        'expert.country',
        'expert.region',
        'expert.emailVerifiedAt',
        'expert.isBanned',
        'expert.role',
        'expert.specialities',
        'expert.description',
        'expert.epochs',
      ])
      .where('expert.username LIKE :searchTerm', { 
        searchTerm: `%${searchTerm}%` 
      })
      .getMany();
  }

  async findOneExpert(id: number): Promise<Expert> {
    const expert = await this.expertRepository.findOne({
      where: { id },
      select: [
        'id',
        'username',
        'email',
        'avatar',
        'phone',
        'country',
        'region',
        'emailVerifiedAt',
        'isBanned',
        'role',
        'specialities',
        'description',
        'epochs',
      ],
    });

    if (!expert) {
      throw new NotFoundException('Expert not found');
    }

    return expert;
  }

  async updateExpert(
    id: number,
    updateExpertDto: UpdateExpertDto,
  ): Promise<Expert> {
    const expert = await this.expertRepository.findOne({ where: { id } });

    if (!expert) {
      throw new NotFoundException('Expert not found');
    }

    const {
      username,
      email,
      country,
      region,
      phone,
      specialities,
      description,
      epochs,
    } = updateExpertDto;

    // Mettre à jour les champs User
    if (username) expert.username = username;
    if (email) expert.email = email;
    if (country) expert.country = country;
    if (region) expert.region = region;
    if (phone) expert.phone = phone;

    // Mettre à jour les champs Expert
    if (specialities) expert.specialities = specialities;
    if (description) expert.description = description;
    if (epochs) expert.epochs = epochs;

    return await this.expertRepository.save(expert);
  }

  async deleteExpert(id: number): Promise<{ message: string }> {
    const expert = await this.expertRepository.findOne({ where: { id } });

    if (!expert) {
      throw new NotFoundException('Expert not found');
    }

    await this.expertRepository.delete(id);

    return { message: 'Expert deleted successfully' };
  }

  async banExpert(id: number, isBanned: boolean): Promise<Expert> {
    const expert = await this.expertRepository.findOne({ where: { id } });

    if (!expert) {
      throw new NotFoundException('Expert not found');
    }

    expert.isBanned = isBanned;
    return await this.expertRepository.save(expert);
  }
}
