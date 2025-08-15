import { Test, TestingModule } from '@nestjs/testing';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { Reservation } from './reservation.entity';

describe('ReservationController', () => {
  let controller: ReservationController;
  let service: ReservationService;

  const mockReservationService = {
    findAll: jest.fn(),
    create: jest.fn(),
    findByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationController],
      providers: [
        {
          provide: ReservationService,
          useValue: mockReservationService,
        },
      ],
    }).compile();

    controller = module.get<ReservationController>(ReservationController);
    service = module.get<ReservationService>(ReservationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of reservations', async () => {
      const result: Partial<Reservation>[] = [
        { id: 1, statut: 'en attente', quantite: 2 },
        { id: 2, statut: 'confirmé', quantite: 1 },
      ];
      mockReservationService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(mockReservationService.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a reservation', async () => {
      const dto: Partial<Reservation> = {
        quantite: 3,
        statut: 'en attente',
      };
      const createdReservation = { id: 5, ...dto };
      mockReservationService.create.mockResolvedValue(createdReservation);

      expect(await controller.create(dto)).toBe(createdReservation);
      expect(mockReservationService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findByUser', () => {
    it('should return reservations for a given user', async () => {
      const userId = 10;
      const reservations = [
        { id: 1, user: { id: userId }, quantite: 1 },
        { id: 2, user: { id: userId }, quantite: 4 },
      ];
      mockReservationService.findByUserId.mockResolvedValue(reservations);

      expect(await controller.findByUser(userId)).toBe(reservations);
      expect(mockReservationService.findByUserId).toHaveBeenCalledWith(userId);
    });
  });
});
