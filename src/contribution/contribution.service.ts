import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import {
  Contribution,
  FileType,
  ContributionStatus,
} from './entities/contribution.entity';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { User } from 'src/auth/entities/user.entity';
import { Monument } from 'src/monument/entities/monument.entity';
import { Express } from 'express';

@Injectable()
export class ContributionService {
  constructor(
    @InjectRepository(Contribution)
    private readonly contributionRepository: Repository<Contribution>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Monument)
    private readonly monumentRepository: Repository<Monument>,
  ) {}

  async create(
    dto: CreateContributionDto,
    userId: number,
    file?: Express.Multer.File,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const monument = await this.monumentRepository.findOne({
      where: { id: dto.monumentId },
    });

    if (!user || !monument) {
      throw new NotFoundException('Utilisateur ou monument non trouvé');
    }

    // Déterminer le type de fichier
    let fileType: FileType | null = null;
    if (file?.mimetype.startsWith('image')) {
      fileType = FileType.IMAGE;
    } else if (file?.mimetype.startsWith('video')) {
      fileType = FileType.VIDEO;
    } else if (file?.mimetype === 'application/pdf') {
      fileType = FileType.PDF;
    }

    const contributionData: DeepPartial<Contribution> = {
      text: dto.text,
      fileUrl: file?.filename,
      fileType,
      user: { id: user.id },
      monument: { id: monument.id },
    };

    const contribution = this.contributionRepository.create(contributionData);
    return this.contributionRepository.save(contribution);
  }

  async findAll() {
    return this.contributionRepository.find({
      relations: ['user', 'monument'],
    });
  }

  async delete(id: number) {
    const found = await this.contributionRepository.findOne({ where: { id } });
    if (!found) {
      throw new NotFoundException('Contribution non trouvée');
    }
    await this.contributionRepository.delete(id);
    return { message: 'Contribution supprimée' };
  }

  // contribution.service.ts
  async updateStatus(
    id: number,
    status: 'accepted' | 'rejected',
    comment: string,
    decidedById: number,
  ) {
    const contribution = await this.contributionRepository.findOne({
      where: { id },
    });
    if (!contribution) {
      throw new NotFoundException('Contribution non trouvée');
    }

    // Convertir les strings en enums
    contribution.status =
      status === 'accepted'
        ? ContributionStatus.ACCEPTED
        : ContributionStatus.REJECTED;
    contribution.decisionComment = comment;
    contribution.decidedById = decidedById;
    contribution.decidedAt = new Date();

    return this.contributionRepository.save(contribution);
  }

  async getPendingContributions() {
    return this.contributionRepository.find({
      where: { status: ContributionStatus.PENDING },
      relations: ['user', 'monument'],
    });
  }
}
