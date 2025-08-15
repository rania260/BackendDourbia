import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './reservation.entity';
import { PackPurchase } from '../pack/entities/pack-purchase.entity';
import { EmailService } from '../email/email.service';
import { User } from '../auth/entities/user.entity';
import { Service } from '../service/entities/service.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepo: Repository<Reservation>,

    @InjectRepository(PackPurchase)
    private purchaseRepo: Repository<PackPurchase>,

    private emailService: EmailService,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Service)
    private serviceRepo: Repository<Service>,
  ) {}

  async findAll() {
    return this.reservationRepo.find();
  }

  async findByUserId(userId: number) {
    return this.reservationRepo.find({
      where: { user: { id: userId } },
      relations: ['packPurchase', 'packPurchase.pack', 'service'],
      order: { id: 'DESC' },
    });
  }

  async getTotalReservedByServiceAndPurchase(
    purchaseId: number,
    serviceId: string,
  ): Promise<number> {
    const result = await this.reservationRepo
      .createQueryBuilder('reservation')
      .select('SUM(reservation.quantite)', 'total')
      .where('reservation.packPurchaseId = :purchaseId', { purchaseId })
      .andWhere('reservation.serviceId = :serviceId', { serviceId })
      .getRawOne();

    return Number(result.total || 0);
  }

  async create(data: CreateReservationDto): Promise<Reservation> {
    const {
      userId,
      packPurchaseId,
      serviceId,
      quantite = 1,
      dateReservation,
      heureFin,
      remarque,
    } = data;

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const purchase = await this.purchaseRepo.findOne({
      where: { id: packPurchaseId },
      relations: ['pack', 'pack.services'],
    });
    if (!purchase) throw new NotFoundException('PackPurchase introuvable');

    const selectedService = purchase.pack.services.find(
      (s) => s.id === serviceId,
    );
    if (!selectedService)
      throw new BadRequestException(
        'Le service sélectionné ne fait pas partie du pack acheté.',
      );

    // Vérifier si le service nécessite une réservation
    if (!selectedService.requiresReservation) {
      throw new BadRequestException(
        "Ce service ne nécessite pas de réservation. Il est directement accessible après l'achat du pack.",
      );
    }

    const totalReserved = await this.getTotalReservedByServiceAndPurchase(
      purchase.id,
      selectedService.id,
    );
    const remaining = purchase.quantite - totalReserved;
    if (quantite > remaining) {
      throw new BadRequestException(
        `Limite dépassée : déjà réservé ${totalReserved}/${purchase.quantite} pour ce service.`,
      );
    }

    const dateDebut = dateReservation ? new Date(dateReservation) : new Date();

    let dateFin: Date | undefined;
    if (heureFin) {
      const [hoursStr, minutesStr] = heureFin.split(':');
      if (hoursStr && minutesStr) {
        dateFin = new Date(dateDebut);
        dateFin.setHours(
          parseInt(hoursStr, 10),
          parseInt(minutesStr, 10),
          0,
          0,
        );
      }
    }

    const reservation = this.reservationRepo.create({
      quantite,
      packPurchase: purchase,
      user,
      service: selectedService,
      dateReservation: dateDebut,
      heureFin: dateFin,
      remarque,
    });

    const savedReservation = await this.reservationRepo.save(reservation);

    await this.emailService.sendEmail({
      subject: 'Confirmation de votre réservation',
      recipients: [{ address: user.email }],
      html: `
        <h2>Bonjour ${user.username},</h2>
        <p>Merci pour votre réservation !</p>
        <p><strong>Pack :</strong> ${purchase.pack.nom}</p>
        <p><strong>Quantité réservée :</strong> ${quantite}</p>
        <p><strong>Service attribué :</strong> ${selectedService.service}</p>
        <p>Date début : ${dateDebut.toLocaleString()}</p>
        <p>Heure fin : ${dateFin ? dateFin.toLocaleTimeString() : 'Non précisée'}</p>
        <br/>
        <p>L'équipe dourbia</p>
      `,
    });

    return savedReservation;
  }

  async getReservedQuantitiesByPurchase(
    purchaseId: number,
  ): Promise<{ serviceId: string; totalReserved: number }[]> {
    const result = await this.reservationRepo
      .createQueryBuilder('reservation')
      .select('reservation.serviceId', 'serviceId')
      .addSelect('SUM(reservation.quantite)', 'totalReserved')
      .where('reservation.packPurchaseId = :purchaseId', { purchaseId })
      .groupBy('reservation.serviceId')
      .getRawMany();

    return result.map((r) => ({
      serviceId: String(r.serviceId),
      totalReserved: Number(r.totalReserved),
    }));
  }

  async remove(id: number): Promise<void> {
    const reservation = await this.reservationRepo.findOne({ where: { id } });
    if (!reservation) throw new NotFoundException('Réservation introuvable');
    await this.reservationRepo.remove(reservation);
  }

  async update(id: number, data: UpdateReservationDto): Promise<Reservation> {
    const reservation = await this.reservationRepo.findOne({
      where: { id },
      relations: ['packPurchase', 'packPurchase.pack', 'service', 'user'],
    });
    if (!reservation) throw new NotFoundException('Réservation introuvable');

    if (data.serviceId && data.serviceId !== reservation.service.id) {
      const selectedService = reservation.packPurchase.pack.services.find(
        (s) => s.id === data.serviceId,
      );
      if (!selectedService) {
        throw new BadRequestException(
          'Le service sélectionné ne fait pas partie du pack acheté.',
        );
      }
      reservation.service = selectedService;
    }

    if (data.quantite !== undefined) {
      const totalReservedExceptCurrentRaw = await this.reservationRepo
        .createQueryBuilder('reservation')
        .select('SUM(reservation.quantite)', 'total')
        .where('reservation.packPurchaseId = :purchaseId', {
          purchaseId: reservation.packPurchase.id,
        })
        .andWhere('reservation.serviceId = :serviceId', {
          serviceId: reservation.service.id,
        })
        .andWhere('reservation.id != :reservationId', {
          reservationId: reservation.id,
        })
        .getRawOne();

      const totalReservedExceptCurrent = Number(
        totalReservedExceptCurrentRaw.total || 0,
      );
      const remaining =
        reservation.packPurchase.quantite - totalReservedExceptCurrent;

      if (data.quantite > remaining) {
        throw new BadRequestException(
          `Limite dépassée : déjà réservé ${totalReservedExceptCurrent}/${reservation.packPurchase.quantite} pour ce service.`,
        );
      }
      reservation.quantite = data.quantite;
    }

    if (data.dateReservation) {
      reservation.dateReservation = new Date(data.dateReservation);
    }

    if (data.heureFin !== undefined) {
      if (data.heureFin === null) {
        reservation.heureFin = undefined;
      } else if (
        typeof data.heureFin === 'string' &&
        data.heureFin.includes(':')
      ) {
        const [hoursStr, minutesStr] = data.heureFin.split(':');
        const dateFin = reservation.dateReservation
          ? new Date(reservation.dateReservation)
          : new Date();
        dateFin.setHours(
          parseInt(hoursStr, 10),
          parseInt(minutesStr, 10),
          0,
          0,
        );
        reservation.heureFin = dateFin;
      }
    }

    if (data.remarque !== undefined) {
      reservation.remarque = data.remarque;
    }

    const savedReservation = await this.reservationRepo.save(reservation);

    // Tu peux aussi renvoyer un mail de confirmation ici

    return savedReservation;
  }
}
