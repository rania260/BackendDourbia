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
import { EmailService } from '../email/email.service';

@Injectable()
export class PartnerService {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
    private readonly emailService: EmailService,
  ) {}

  async createPartner(createPartnerDto: CreatePartnerDto): Promise<Partner> {
    const {
      email,
      username,
      password,
      avatar,
      phone,
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
      avatar: avatar || '',
      country: country || '',
      region: region || '',
      phone: phone || '',
      role: USERROLES.PARTNER,
      types: types || [],
      description: description || '',
      regions: regions || [],
      services: services || [],
      emailVerifiedAt: new Date(), // Marquer l'email comme vérifié par défaut
    });

    const savedPartner = await this.partnerRepository.save(partner);

    // Envoyer un email avec les informations de connexion
    try {
      const emailSubject = 'Bienvenue sur Dourbia - Votre compte partenaire';
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Bienvenue sur Dourbia !</h2>
          <p>Bonjour <strong>${username}</strong>,</p>
          <p>Votre compte partenaire a été créé avec succès. Voici vos informations de connexion :</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email :</strong> ${email}</p>
            <p><strong>Mot de passe :</strong> ${password}</p>
          </div>
          <p>Vous pouvez maintenant vous connecter à votre compte et commencer à gérer vos services.</p>
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
      // Ne pas faire échouer la création du partenaire si l'email échoue
    }

    return savedPartner;
  }

  async findAllPartners(): Promise<Partner[]> {
    return await this.partnerRepository.find({
      relations: ['servicesList'],
      order: { id: 'DESC' },
    });
  }

  async findPartnerWithServices(id: number): Promise<Partner> {
    const partner = await this.partnerRepository.findOne({
      where: { id },
      relations: ['servicesList'],
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    return partner;
  }

  async searchPartners(searchTerm: string): Promise<Partner[]> {
    return await this.partnerRepository
      .createQueryBuilder('partner')
      .leftJoinAndSelect('partner.servicesList', 'services')
      .where('partner.username LIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      })
      .getMany();
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

  async banPartner(id: number, isBanned: boolean): Promise<Partner> {
    const partner = await this.partnerRepository.findOne({ where: { id } });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    partner.isBanned = isBanned;
    return await this.partnerRepository.save(partner);
  }
}
