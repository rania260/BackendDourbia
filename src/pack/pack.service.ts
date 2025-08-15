import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { format } from 'date-fns';
import Stripe from 'stripe';
import { Request } from 'express';
import { CreatePackDto } from './dto/create-pack.dto';
import { UpdatePackDto } from './dto/update-pack.dto';
import { PurchasePackDto } from './dto/purchase-pack.dto';
import { StripePaymentDto } from './dto/stripe-payment.dto';
import { Pack } from './entities/pack.entity';
import { PackPurchase } from './entities/pack-purchase.entity';
import { Circuit } from '../circuit/entities/circuit.entity';
import { Service } from '../service/entities/service.entity';
import { StripeService } from './services/stripe.service';
import { EmailService } from '../email/email.service';
import { NotificationGateway } from '../notifications/notification.gateway';

@Injectable()
export class PackService implements OnModuleInit {
  constructor(
    @InjectRepository(Pack)
    private readonly packRepository: Repository<Pack>,
    @InjectRepository(PackPurchase)
    private readonly purchaseRepository: Repository<PackPurchase>,
    @InjectRepository(Circuit)
    private readonly circuitRepository: Repository<Circuit>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly stripeService: StripeService,
    private readonly emailService: EmailService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async onModuleInit() {
    const packs = await this.packRepository.find({
      relations: ['circuit', 'services'],
    });
    console.log('\n📦 Packs disponibles :');
    packs.forEach((pack) => {
      console.log(`- ${pack.nom} : ${pack.prix} DT`);
    });
  }

  async create(createPackDto: CreatePackDto): Promise<Pack> {
    const { circuitId, serviceIds, ...packData } = createPackDto;

    // Vérifier que le circuit existe
    const circuit = await this.circuitRepository.findOne({
      where: { id: circuitId },
    });
    if (!circuit) {
      throw new NotFoundException(`Circuit avec l'ID ${circuitId} non trouvé`);
    }

    // Créer le pack
    const pack = this.packRepository.create({
      ...packData,
      circuit,
    });

    // Ajouter les services si fournis
    if (serviceIds && serviceIds.length > 0) {
      const services = await this.serviceRepository.findByIds(serviceIds);
      if (services.length !== serviceIds.length) {
        throw new NotFoundException('Un ou plusieurs services non trouvés');
      }
      pack.services = services;
    }

    return await this.packRepository.save(pack);
  }

  async findAll(): Promise<Pack[]> {
    return await this.packRepository.find({
      relations: ['circuit', 'services'],
    });
  }

  async findOne(id: number): Promise<Pack> {
    const pack = await this.packRepository.findOne({
      where: { id },
      relations: ['circuit', 'services'],
    });

    if (!pack) {
      throw new NotFoundException(`Pack avec l'ID ${id} non trouvé`);
    }

    return pack;
  }

  async update(id: number, updatePackDto: UpdatePackDto): Promise<Pack> {
    const { circuitId, serviceIds, ...packData } = updatePackDto;
    
    const pack = await this.findOne(id);

    // Mettre à jour le circuit si fourni
    if (circuitId) {
      const circuit = await this.circuitRepository.findOne({
        where: { id: circuitId },
      });
      if (!circuit) {
        throw new NotFoundException(`Circuit avec l'ID ${circuitId} non trouvé`);
      }
      pack.circuit = circuit;
    }

    // Mettre à jour les services si fournis
    if (serviceIds !== undefined) {
      if (serviceIds.length > 0) {
        const services = await this.serviceRepository.findByIds(serviceIds);
        if (services.length !== serviceIds.length) {
          throw new NotFoundException('Un ou plusieurs services non trouvés');
        }
        pack.services = services;
      } else {
        pack.services = [];
      }
    }

    // Appliquer les autres modifications
    Object.assign(pack, packData);

    return await this.packRepository.save(pack);
  }

  async remove(id: number): Promise<void> {
    const pack = await this.findOne(id);
    await this.packRepository.remove(pack);
  }

  // ============= NOUVELLES MÉTHODES D'ACHAT =============

  async findByUserId(userId: number) {
    return this.purchaseRepository.find({
      where: { user: { id: userId } },
      relations: ['pack', 'pack.circuit', 'pack.services'],
    });
  }

  async purchasePack(
    userId: number,
    packId: number,
    quantite = 1,
    typePaiement: 'en ligne' | 'sur place' = 'sur place',
    methodePaiement?: 'stripe' | 'flouci',
    idCommande?: string,
  ) {
    const pack = await this.packRepository.findOne({ where: { id: packId } });
    if (!pack) throw new NotFoundException('Pack non trouvé');

    const prixTotal = Number(pack.prix) * quantite;

    const purchase = this.purchaseRepository.create({
      user: { id: userId },
      pack: { id: packId },
      quantite,
      prixTotal,
      typePaiement,
      methodePaiement,
      idCommande,
      isPaid: typePaiement === 'en ligne', // Automatiquement payé si en ligne
    });

    const savedPurchase = await this.purchaseRepository.save(purchase);

    const dateStr = format(new Date(), 'yyyyMMdd');
    const paddedId = savedPurchase.id.toString().padStart(5, '0');
    const numeroCommande = `CMD-${dateStr}-${paddedId}`;

    savedPurchase.numeroCommande = numeroCommande;
    const finalPurchase = await this.purchaseRepository.save(savedPurchase);

    await this.sendConfirmationEmail(finalPurchase.id);

    // Notification si pas de réservation
    const existingReservations = await this.purchaseRepository.manager
      .getRepository('Reservation')
      .find({
        where: { packPurchase: { id: finalPurchase.id } },
      });

    if (existingReservations.length === 0) {
      this.notificationGateway.sendToUser(userId, {
        title: 'Réservation manquante',
        message: `Vous avez acheté le pack "${pack.nom}" sans encore réserver de service.`,
      });
    }

    return finalPurchase;
  }

  async handleSuccessfulPayment(session: Stripe.Checkout.Session) {
    if (
      !session.metadata ||
      !session.metadata.userId ||
      !session.metadata.packId
    ) {
      throw new Error('⚠️ Métadonnées manquantes dans la session Stripe.');
    }

    const userId = parseInt(session.metadata.userId);
    const packId = parseInt(session.metadata.packId);
    const quantite = session.metadata?.quantite
      ? parseInt(session.metadata.quantite)
      : 1;

    const purchase = await this.purchasePack(
      userId,
      packId,
      quantite,
      'en ligne',
      'stripe',
      session.id,
    );

    console.log(
      `✅ Paiement Stripe enregistré pour utilisateur ${userId} - Session: ${session.id}`,
    );

    return purchase;
  }

  async initiateStripePayment(userId: number, packId: number, quantite = 1) {
    const pack = await this.packRepository.findOne({ where: { id: packId } });
    if (!pack) throw new NotFoundException('Pack non trouvé');

    const total = Number(pack.prix) * quantite;
    return this.stripeService.createCheckoutSession(total, userId, packId, quantite);
  }

  verifyStripeEvent(req: Request, signature: string): Stripe.Event {
    const rawBody = (req as any).rawBody;
    const secret = process.env.STRIPE_WEBHOOK_SECRET as string;
    return this.stripeService.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      secret,
    );
  }

  private async sendConfirmationEmail(purchaseId: number) {
    const purchase = await this.purchaseRepository.findOne({
      where: { id: purchaseId },
      relations: ['user', 'pack'],
    });

    if (!purchase || !purchase.user || !purchase.pack) {
      console.warn('❌ Achat incomplet, email non envoyé.');
      return;
    }

    await this.emailService.sendEmail({
      subject: 'Confirmation de votre commande',
      recipients: [{ address: purchase.user.email }],
      html: `
        <h2>Bonjour ${purchase.user.username},</h2>
        <p>Merci pour votre commande sur <strong>Dourbia</strong>.</p>
        <ul>
          <li><strong>Commande :</strong> ${purchase.numeroCommande}</li>
          <li><strong>Pack :</strong> ${purchase.pack.nom}</li>
          <li><strong>Quantité :</strong> ${purchase.quantite}</li>
          <li><strong>Total :</strong> ${purchase.prixTotal} DT</li>
          <li><strong>Paiement :</strong> ${purchase.typePaiement}</li>
        </ul>
        <p>À bientôt sur notre plateforme 🌍</p>
      `,
    });
  }

  // ============= GESTION DES PAIEMENTS =============

  async updatePaymentStatus(
    purchaseId: number,
    isPaid: boolean,
  ): Promise<PackPurchase> {
    const purchase = await this.purchaseRepository.findOne({
      where: { id: purchaseId },
      relations: ['user', 'pack'],
    });

    if (!purchase) {
      throw new NotFoundException('Achat de pack introuvable');
    }

    purchase.isPaid = isPaid;
    const updatedPurchase = await this.purchaseRepository.save(purchase);

    // Envoyer une notification à l'utilisateur si le paiement est confirmé
    if (isPaid) {
      await this.emailService.sendEmail({
        subject: 'Paiement confirmé - Dourbia',
        recipients: [{ address: purchase.user.email }],
        html: `
          <h2>Bonjour ${purchase.user.username},</h2>
          <p>Votre paiement pour la commande <strong>${purchase.numeroCommande}</strong> a été confirmé.</p>
          <p><strong>Pack :</strong> ${purchase.pack.nom}</p>
          <p><strong>Montant :</strong> ${purchase.prixTotal} DT</p>
          <p>Vous pouvez maintenant effectuer vos réservations de services.</p>
          <p>Merci de votre confiance ! 🌍</p>
        `,
      });

      // TODO: Implémenter la notification WebSocket
      // this.notificationGateway.sendNotificationToUser(purchase.user.id, {
      //   type: 'payment_confirmed',
      //   message: `Votre paiement pour le pack "${purchase.pack.nom}" a été confirmé.`,
      //   data: { purchaseId: purchase.id, packName: purchase.pack.nom },
      // });
    }

    return updatedPurchase;
  }

  async getUnpaidPurchases(): Promise<PackPurchase[]> {
    return this.purchaseRepository.find({
      where: {
        typePaiement: 'sur place',
        isPaid: false,
      },
      relations: ['user', 'pack'],
      order: { dateAchat: 'DESC' },
    });
  }

  async getAllPurchases(): Promise<PackPurchase[]> {
    return this.purchaseRepository.find({
      relations: ['user', 'pack'],
      order: { dateAchat: 'DESC' },
    });
  }
}
