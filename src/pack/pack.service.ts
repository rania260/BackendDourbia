import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePackDto } from './dto/create-pack.dto';
import { UpdatePackDto } from './dto/update-pack.dto';
import { Pack } from './entities/pack.entity';
import { Circuit } from '../circuit/entities/circuit.entity';
import { Service } from '../service/entities/service.entity';

@Injectable()
export class PackService {
  constructor(
    @InjectRepository(Pack)
    private readonly packRepository: Repository<Pack>,
    @InjectRepository(Circuit)
    private readonly circuitRepository: Repository<Circuit>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

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
}
