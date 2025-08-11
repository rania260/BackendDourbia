import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { AssignCircuitsToDestinationDto } from './dto/assign-circuits-to-destination.dto';
import { Destination } from './entities/destination.entity';
import { Circuit } from '../circuit/entities/circuit.entity';

@Injectable()
export class DestinationService {
  constructor(
    @InjectRepository(Destination)
    private readonly destinationRepository: Repository<Destination>,
    @InjectRepository(Circuit)
    private readonly circuitRepository: Repository<Circuit>,
  ) {}

  async create(createDto: CreateDestinationDto, image?: Express.Multer.File): Promise<Destination> {
    const destination = this.destinationRepository.create({
      ...createDto,
      image: image ? image.filename : createDto.image, // Utilise le nom du fichier uploadé ou l'URL fournie
    });
    return await this.destinationRepository.save(destination);
  }

  async findAll(): Promise<Destination[]> {
    return await this.destinationRepository.find({
      relations: ['circuits'],
    });
  }

  async findOne(id: number): Promise<Destination | null> {
    return await this.destinationRepository.findOne({
      where: { id },
      relations: ['circuits'],
    });
  }

  async update(id: number, updateDto: UpdateDestinationDto): Promise<Destination | null> {
    const destination = await this.destinationRepository.preload({
      id,
      ...updateDto,
    });
    if (!destination) return null;
    return await this.destinationRepository.save(destination);
  }

  async remove(id: number): Promise<Destination | null> {
    const destination = await this.findOne(id);
    if (!destination) return null;
    return await this.destinationRepository.remove(destination);
  }

  async assignCircuits(
    destinationId: number,
    assignDto: AssignCircuitsToDestinationDto,
  ): Promise<Destination | null> {
    const destination = await this.findOne(destinationId);
    if (!destination) return null;

    // Retirer la destination de tous les circuits actuels de cette destination
    await this.circuitRepository.query(
      'UPDATE circuit SET destination_id = NULL WHERE destination_id = $1',
      [destinationId]
    );

    // Assigner la nouvelle destination aux circuits sélectionnés
    if (assignDto.circuitIds.length > 0) {
      const placeholders = assignDto.circuitIds.map((_, index) => `$${index + 2}`).join(',');
      await this.circuitRepository.query(
        `UPDATE circuit SET destination_id = $1 WHERE id IN (${placeholders})`,
        [destinationId, ...assignDto.circuitIds]
      );
    }

    return await this.findOne(destinationId);
  }

  async getAvailableCircuits(): Promise<Circuit[]> {
    return await this.circuitRepository.find({
      relations: ['destination'],
    });
  }
}
