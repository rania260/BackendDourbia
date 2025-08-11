import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Circuit } from './entities/circuit.entity';
import { CircuitMonument } from './entities/circuit-monument.entity';
import { Monument } from '../monument/entities/monument.entity';
import { Destination } from '../destination/entities/destination.entity';
import { CreateCircuitDto } from './dto/create-circuit.dto';
import { UpdateCircuitDto } from './dto/update-circuit.dto';
import { CreateCircuitWithMonumentsDto } from './dto/create-circuit-with-monuments.dto';
import { UpdateMonumentOrderDto } from './dto/update-monument-order.dto';

@Injectable()
export class CircuitService {
  constructor(
    @InjectRepository(Circuit)
    private readonly circuitRepository: Repository<Circuit>,
    @InjectRepository(CircuitMonument)
    private readonly circuitMonumentRepository: Repository<CircuitMonument>,
    @InjectRepository(Monument)
    private readonly monumentRepository: Repository<Monument>,
    @InjectRepository(Destination)
    private readonly destinationRepository: Repository<Destination>,
  ) {}

  async create(createDto: CreateCircuitDto, image?: Express.Multer.File): Promise<Circuit> {
    const circuit = this.circuitRepository.create({
      ...createDto,
      img: image ? image.filename : createDto.img, // Utilise le nom du fichier uploadé ou l'URL fournie
    });
    return await this.circuitRepository.save(circuit);
  }

  async createWithMonuments(
    createDto: CreateCircuitWithMonumentsDto,
  ): Promise<Circuit> {
    // Créer le circuit
    const { monuments, destinationId, ...circuitData } = createDto;

    // Vérifier si la destination existe
    let destination: Destination | undefined = undefined;
    if (destinationId) {
      const foundDestination = await this.destinationRepository.findOneBy({
        id: destinationId,
      });
      if (!foundDestination) {
        throw new NotFoundException(
          `Destination avec l'id ${destinationId} non trouvée`,
        );
      }
      destination = foundDestination;
    }

    const circuit = this.circuitRepository.create({
      ...circuitData,
      destination,
    });
    const savedCircuit = await this.circuitRepository.save(circuit);

    // Ajouter les monuments au circuit
    for (const monumentData of monuments) {
      const monument = await this.monumentRepository.findOneBy({
        id: monumentData.monumentId,
      });
      if (!monument) {
        throw new NotFoundException(
          `Monument avec l'id ${monumentData.monumentId} non trouvé`,
        );
      }

      const circuitMonument = this.circuitMonumentRepository.create({
        circuit: savedCircuit,
        monument,
        ordre: monumentData.ordre,
      });
      await this.circuitMonumentRepository.save(circuitMonument);
    }

    const result = await this.findOneWithDetails(savedCircuit.id);
    if (!result) {
      throw new NotFoundException(
        `Circuit créé non trouvé avec l'id ${savedCircuit.id}`,
      );
    }
    return result;
  }

  async findAll(): Promise<Circuit[]> {
    return await this.circuitRepository.find({
      relations: [
        'destination',
        'circuitMonuments',
        'circuitMonuments.monument',
      ],
    });
  }

  async findOne(id: number): Promise<Circuit | null> {
    return await this.circuitRepository.findOneBy({ id });
  }

  async findOneWithDetails(id: number): Promise<Circuit | null> {
    return await this.circuitRepository.findOne({
      where: { id },
      relations: [
        'destination',
        'circuitMonuments',
        'circuitMonuments.monument',
      ],
      order: {
        circuitMonuments: {
          ordre: 'ASC',
        },
      },
    });
  }

  async addMonumentToCircuit(
    circuitId: number,
    monumentId: number,
    ordre: number,
  ): Promise<CircuitMonument> {
    const circuit = await this.circuitRepository.findOneBy({ id: circuitId });
    if (!circuit) {
      throw new NotFoundException(`Circuit avec l'id ${circuitId} non trouvé`);
    }

    const monument = await this.monumentRepository.findOneBy({
      id: monumentId,
    });
    if (!monument) {
      throw new NotFoundException(
        `Monument avec l'id ${monumentId} non trouvé`,
      );
    }

    const circuitMonument = this.circuitMonumentRepository.create({
      circuit,
      monument,
      ordre,
    });

    return await this.circuitMonumentRepository.save(circuitMonument);
  }

  async removeMonumentFromCircuit(
    circuitId: number,
    monumentId: number,
  ): Promise<boolean> {
    const result = await this.circuitMonumentRepository.delete({
      circuit: { id: circuitId },
      monument: { id: monumentId },
    });

    return (result.affected ?? 0) > 0;
  }

  async updateMonumentOrder(
    updateOrderDto: UpdateMonumentOrderDto,
  ): Promise<CircuitMonument> {
    const { circuitId, monumentId, newOrder } = updateOrderDto;

    const circuitMonument = await this.circuitMonumentRepository.findOne({
      where: {
        circuit: { id: circuitId },
        monument: { id: monumentId },
      },
    });

    if (!circuitMonument) {
      throw new NotFoundException(
        `Relation entre circuit ${circuitId} et monument ${monumentId} non trouvée`,
      );
    }

    circuitMonument.ordre = newOrder;
    return await this.circuitMonumentRepository.save(circuitMonument);
  }

  async update(
    id: number,
    updateDto: UpdateCircuitDto,
  ): Promise<Circuit | null> {
    const circuit = await this.circuitRepository.preload({
      id,
      ...updateDto,
    });
    if (!circuit) return null;
    return await this.circuitRepository.save(circuit);
  }

  async remove(id: number): Promise<Circuit | null> {
    const circuit = await this.findOne(id);
    if (!circuit) return null;
    return await this.circuitRepository.remove(circuit);
  }
}
