// src/feedback/feedback.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const feedback = this.feedbackRepository.create({ ...createFeedbackDto, user });
    return this.feedbackRepository.save(feedback);
  }

  findAll() {
    return this.feedbackRepository.find({ relations: ['user'] }); // Pour admin : inclut info utilisateur
  }

  findOne(id: number) {
    return this.feedbackRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async update(id: number, updateFeedbackDto: UpdateFeedbackDto) {
    const feedback = await this.feedbackRepository.findOne({ where: { id } });
    if (!feedback) throw new NotFoundException('Feedback not found');

    Object.assign(feedback, updateFeedbackDto);
    return this.feedbackRepository.save(feedback);
  }

  async remove(id: number) {
    const feedback = await this.feedbackRepository.findOne({ where: { id } });
    if (!feedback) throw new NotFoundException('Feedback not found');
    return this.feedbackRepository.remove(feedback);
  }
}
