import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from './reservation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './reservation.entity';
import { PackPurchase } from '../pack/pack-purchase.entity';
import { User } from '../auth/entities/user.entity';
import { EmailService } from '../email/email.service';

// Mock complet pour Destination
const mockDestination = {
  id: 1,
  nom: 'Destination test',
  description: 'Description destination',
  region: 'Tunis',
  createdAt: new Date(),
  updatedAt: new Date(),
} as any; // Ajoute le type exact si possible

// Mock complet pour Circuit
const mockCircuit = {
  id: 1,
  nom_circuit: 'Circuit test',
  nbr_etape: 3,
  kilometrage: 150,
  duree_heures: 5,
  duree_minutes: 300,
  description: 'Description du circuit',
  prix: 100,
  difficulte: 'moyenne',
  image: 'circuit.png',
  region: 'Tunis',
  created_at: new Date(),
  updated_at: new Date(),
  destination: mockDestination,
  nbr_etapeCircuit: 3,
  monuments: [],
  packs: [],
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

// Mock complet pour User
const mockUser: User = {
  id: 1,
  email: 'user@example.com',
  username: 'user1',
  password: 'hashedpassword',
  avatar: 'avatar.png',
  role: 'user',
  phone: '12345678',
  country: 'Tunisia',
  region: 'Tunis',
  createdAt: new Date(),
  updatedAt: new Date(),
  reservations: [],
} as any;

// Mock complet pour PackPurchase avec services
const mockPackPurchase: PackPurchase = {
  id: 1,
  user: mockUser,
  pack: {
    id: 1,
    nom: 'Pack 1',
    description: 'Description du pack',
    prix: 100,
    circuit: mockCircuit,
    purchases: [],
    services: [{ nom: 'Service 1' }],
  },
  quantite: 10,
  prixTotal: 100,
  dateAchat: new Date(),
  typePaiement: 'card',
  methodePaiement: 'stripe',
  updatePrixTotal: jest.fn(),
} as any;

// Mock Reservation
const mockReservation: Reservation = {
  id: 1,
  user: mockUser,
  packPurchase: mockPackPurchase,
  quantite: 1,
  service: mockPackPurchase.pack.services[0],
  dateReservation: new Date(),
  statut: 'en attente',
  remarque: null,
} as any;

describe('ReservationService', () => {
  let service: ReservationService;
  let reservationRepo: Repository<Reservation>;
  let purchaseRepo: Repository<PackPurchase>;
  let userRepo: Repository<User>;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn().mockReturnValue(mockReservation),
            save: jest.fn().mockResolvedValue(mockReservation),
            createQueryBuilder: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue({ total: 0 }),
            }),
          },
        },
        {
          provide: getRepositoryToken(PackPurchase),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockPackPurchase),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
    reservationRepo = module.get<Repository<Reservation>>(getRepositoryToken(Reservation));
    purchaseRepo = module.get<Repository<PackPurchase>>(getRepositoryToken(PackPurchase));
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a reservation successfully', async () => {
      const data = {
        user: mockUser,
        packPurchase: mockPackPurchase,
        quantite: 1,
      };

      const result = await service.create(data);

      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: mockUser.id } });
      expect(purchaseRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockPackPurchase.id },
        relations: ['pack', 'pack.services'],
      });
      expect(reservationRepo.create).toHaveBeenCalled();
      expect(reservationRepo.save).toHaveBeenCalled();
      expect(emailService.sendEmail).toHaveBeenCalled();
      expect(result).toEqual(mockReservation);
    });

    it('should throw error if user is missing or invalid', async () => {
      await expect(
        service.create({ user: null as any, packPurchase: mockPackPurchase, quantite: 1 }),
      ).rejects.toThrow('Utilisateur manquant ou invalide.');
    });

    it('should throw error if user not found or missing email/username', async () => {
      (userRepo.findOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.create({ user: mockUser, packPurchase: mockPackPurchase, quantite: 1 }),
      ).rejects.toThrow('Utilisateur introuvable ou incomplet (email ou username manquant).');
    });

    it('should throw error if packPurchase is missing or invalid', async () => {
      await expect(
        service.create({ user: mockUser, quantite: 1 } as any),
      ).rejects.toThrow('Achat de pack manquant ou invalide.');
    });

    it('should throw error if quantite is missing or invalid', async () => {
      await expect(
        service.create({ user: mockUser, packPurchase: mockPackPurchase } as any),
      ).rejects.toThrow('Quantité invalide ou manquante.');
    });

    it('should throw error if PackPurchase not found', async () => {
      (purchaseRepo.findOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.create({ user: mockUser, packPurchase: { id: 999 } as any, quantite: 1 }),
      ).rejects.toThrow('PackPurchase introuvable');
    });

    it('should throw error if quantity exceeds remaining', async () => {
      (reservationRepo.createQueryBuilder as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: 9 }), // 9 already reserved
      });

      await expect(
        service.create({ user: mockUser, packPurchase: mockPackPurchase, quantite: 2 }),
      ).rejects.toThrow(
        `Vous avez déjà réservé 9/${mockPackPurchase.quantite}. Il vous reste 1 services.`,
      );
    });

    it('should throw error if no service associated to pack', async () => {
      const packPurchaseWithoutService = {
        id: 1,
        user: mockUser,
        quantite: 10,
        prixTotal: 100,
        dateAchat: new Date(),
        typePaiement: 'en ligne',
        methodePaiement: 'stripe',
        pack: {
          id: 1,
          nom: 'Pack vide',
          description: 'Description du pack',
          prix: 100,
          circuit: mockCircuit,
          purchases: [],
          services: [],
        },
        updatePrixTotal: () => {},
      } as PackPurchase;

      (purchaseRepo.findOne as jest.Mock).mockResolvedValueOnce(packPurchaseWithoutService);

      await expect(
        service.create({ user: mockUser, packPurchase: packPurchaseWithoutService, quantite: 1 }),
      ).rejects.toThrow('Aucun service associé au pack.');
    });
  });
});
