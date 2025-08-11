import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { Destination } from './entities/destination.entity';

@Injectable()
export class DestinationService {
  constructor(
    @InjectRepository(Destination)
    private readonly destinationRepository: Repository<Destination>,
  ) {}

  async create(createDto: CreateDestinationDto, image?: Express.Multer.File): Promise<Destination> {
    const destination = this.destinationRepository.create({
      ...createDto,
      image: image ? image.filename : createDto.image, // Utilise le nom du fichier uploadé ou l'URL fournie
    });
    return await this.destinationRepository.save(destination);
  }

  async findAll(): Promise<Destination[]> {
    return await this.destinationRepository.find();
  }

  async findOne(id: number): Promise<Destination | null> {
    return await this.destinationRepository.findOneBy({ id });
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
}
