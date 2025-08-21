import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Expert } from './entities/expert.entity';
import { User } from '../auth/entities/user.entity';
import { CreateExpertDto } from './dto/create-expert.dto';
import { UpdateExpertDto } from './dto/update-expert.dto';
import { USERROLES } from '../utils/enum';
import { EmailService } from '../email/email.service';

@Injectable()
export class ExpertService {
  constructor(
    @InjectRepository(Expert)
    private readonly expertRepository: Repository<Expert>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
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
      emailVerifiedAt: new Date(), // Marquer l'email comme vérifié par défaut
    });

    const savedExpert = await this.expertRepository.save(expert);

    // Envoyer un email avec les informations de connexion
    try {
      const emailSubject = 'Bienvenue sur Dourbia - Votre compte expert';
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Bienvenue sur Dourbia !</h2>
          <p>Bonjour <strong>${username}</strong>,</p>
          <p>Votre compte expert a été créé avec succès. Voici vos informations de connexion :</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email :</strong> ${email}</p>
            <p><strong>Mot de passe :</strong> ${password}</p>
          </div>
          <p><strong>Vos spécialités :</strong> ${specialities.join(', ')}</p>
          <p><strong>Époques de spécialisation :</strong> ${epochs.join(', ')}</p>
          <p>Vous pouvez maintenant vous connecter à votre compte et commencer à partager votre expertise.</p>
          <p style="color: #dc2626; font-weight: bold;">Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe lors de votre première connexion.</p>
          <p>Cordialement,<br>L'équipe Dourbia</p>
        </div>
      `;

      await this.emailService.sendEmail({
        subject: emailSubject,
        recipients: [{ address: email }],
        html: emailHtml,
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      // Ne pas faire échouer la création de l'expert si l'email échoue
    }

    return savedExpert;
  }

  async findAllExperts(): Promise<any[]> {
    // Récupérer tous les utilisateurs avec le rôle EXPERT
    const expertsFromUsers = await this.userRepository.find({
      where: { role: USERROLES.EXPERT },
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
      ],
    });

    // Récupérer les experts de la table Expert pour les données supplémentaires
    const expertsFromExpertTable = await this.expertRepository.find({
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

    // Créer un map des experts de la table Expert pour récupérer facilement les données supplémentaires
    const expertDataMap = new Map<
      number,
      { specialities: string[]; description: string; epochs: string[] }
    >();
    expertsFromExpertTable.forEach((expert) => {
      expertDataMap.set(expert.id, {
        specialities: expert.specialities || [],
        description: expert.description || '',
        epochs: expert.epochs || [],
      });
    });

    // Combiner les données
    const allExperts = expertsFromUsers.map((user) => {
      const expertData = expertDataMap.get(user.id) || {
        specialities: [],
        description: '',
        epochs: [],
      };

      return {
        ...user,
        specialities: expertData.specialities,
        description: expertData.description,
        epochs: expertData.epochs,
      };
    });

    return allExperts;
  }

  async searchExperts(searchTerm: string): Promise<any[]> {
    // Rechercher dans la table User tous les utilisateurs avec le rôle EXPERT
    const expertsFromUsers = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.avatar',
        'user.phone',
        'user.country',
        'user.region',
        'user.emailVerifiedAt',
        'user.isBanned',
        'user.role',
      ])
      .where('user.role = :role', { role: USERROLES.EXPERT })
      .andWhere('user.username LIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      })
      .getMany();

    // Récupérer les données supplémentaires des experts de la table Expert
    const expertIds = expertsFromUsers.map((user) => user.id);
    let expertsFromExpertTable: Expert[] = [];
    
    if (expertIds.length > 0) {
      expertsFromExpertTable = await this.expertRepository
        .createQueryBuilder('expert')
        .select([
          'expert.id',
          'expert.specialities',
          'expert.description',
          'expert.epochs',
        ])
        .where('expert.id IN (:...ids)', { ids: expertIds })
        .getMany();
    }

    // Créer un map des experts de la table Expert
    const expertDataMap = new Map<
      number,
      { specialities: string[]; description: string; epochs: string[] }
    >();
    expertsFromExpertTable.forEach((expert) => {
      expertDataMap.set(expert.id, {
        specialities: expert.specialities || [],
        description: expert.description || '',
        epochs: expert.epochs || [],
      });
    });

    // Combiner les données
    const searchResults = expertsFromUsers.map((user) => {
      const expertData = expertDataMap.get(user.id) || {
        specialities: [],
        description: '',
        epochs: [],
      };

      return {
        ...user,
        specialities: expertData.specialities,
        description: expertData.description,
        epochs: expertData.epochs,
      };
    });

    return searchResults;
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
