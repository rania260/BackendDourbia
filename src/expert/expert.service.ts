import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Expert } from './entities/expert.entity';
import { User } from '../auth/entities/user.entity';
import { CreateExpertDto } from './dto/create-expert.dto';
import { UpdateExpertDto } from './dto/update-expert.dto';
import { USERROLES } from '../utils/enum';

@Injectable()
export class ExpertService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Expert)
    private readonly expertRepository: Repository<Expert>,
  ) {}

  async createExpert(createExpertDto: CreateExpertDto): Promise<{ user: User; expert: Expert }> {
    const { email, username, password, country, region, specialities, description, epochs } = createExpertDto;

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
      role: USERROLES.EXPERT,
    });

    const savedUser = await this.userRepository.save(user);

    const expert = this.expertRepository.create({
      user: savedUser,
      specialities,
      description,
      epochs,
    });

    await this.expertRepository.save(expert);

    return { user: savedUser, expert };
  }

  async findAllExperts(): Promise<any[]> {
    const experts = await this.expertRepository.find({
      relations: ['user'],
    });

    return experts.map(expert => ({
      id: expert.user.id,
      username: expert.user.username,
      email: expert.user.email,
      avatar: expert.user.avatar,
      phone: expert.user.phone,
      country: expert.user.country,
      region: expert.user.region,
      emailVerifiedAt: expert.user.emailVerifiedAt,
      isBanned: expert.user.isBanned,
      role: expert.user.role,
      specialities: expert.specialities,
      description: expert.description,
      epochs: expert.epochs,
    }));
  }

  async findOneExpert(id: number): Promise<any> {
    const expert = await this.expertRepository.findOne({
      where: { user: { id } },
      relations: ['user'],
    });

    if (!expert) {
      throw new NotFoundException('Expert not found');
    }

    return {
      ...expert.user,
      specialities: expert.specialities,
      description: expert.description,
      epochs: expert.epochs,
    };
  }

  async updateExpert(id: number, updateExpertDto: UpdateExpertDto): Promise<any> {
    const expert = await this.expertRepository.findOne({
      where: { user: { id } },
      relations: ['user'],
    });

    if (!expert) {
      throw new NotFoundException('Expert not found');
    }

    const { username, email, country, region, phone, specialities, description, epochs } = updateExpertDto;

    // Update User fields
    if (username) expert.user.username = username;
    if (email) expert.user.email = email;
    if (country) expert.user.country = country;
    if (region) expert.user.region = region;
    if (phone) expert.user.phone = phone;

    await this.userRepository.save(expert.user);

    // Update Expert fields
    if (specialities) expert.specialities = specialities;
    if (description) expert.description = description;
    if (epochs) expert.epochs = epochs;

    await this.expertRepository.save(expert);

    return { message: 'Expert updated successfully' };
  }

  async deleteExpert(id: number): Promise<{ message: string }> {
    const expert = await this.expertRepository.findOne({
      where: { user: { id } },
      relations: ['user'],
    });

    if (!expert) {
      throw new NotFoundException('Expert not found');
    }

    await this.expertRepository.delete(expert.id);
    await this.userRepository.delete(id);

    return { message: 'Expert deleted successfully' };
  }
}