import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CircuitService } from './circuit.service';
import { CreateCircuitDto } from './dto/create-circuit.dto';
import { UpdateCircuitDto } from './dto/update-circuit.dto';
import { CreateCircuitWithMonumentsDto } from './dto/create-circuit-with-monuments.dto';
import { UpdateMonumentOrderDto } from './dto/update-monument-order.dto';
import { Circuit } from './entities/circuit.entity';
import { CircuitMonument } from './entities/circuit-monument.entity';

@Controller('circuit')
export class CircuitController {
  constructor(private readonly circuitService: CircuitService) {}

  @Post('create')
  create(@Body() createDto: CreateCircuitDto): Promise<Circuit> {
    return this.circuitService.create(createDto);
  }

  @Post('create-with-monuments')
  createWithMonuments(
    @Body() createDto: CreateCircuitWithMonumentsDto,
  ): Promise<Circuit> {
    return this.circuitService.createWithMonuments(createDto);
  }

  @Get('getAll')
  findAll(): Promise<Circuit[]> {
    return this.circuitService.findAll();
  }

  @Get('get/:id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Circuit | null> {
    return this.circuitService.findOne(id);
  }

  @Get('get-with-details/:id')
  findOneWithDetails(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Circuit | null> {
    return this.circuitService.findOneWithDetails(id);
  }

  @Post(':circuitId/monuments/:monumentId')
  addMonumentToCircuit(
    @Param('circuitId', ParseIntPipe) circuitId: number,
    @Param('monumentId', ParseIntPipe) monumentId: number,
    @Body('ordre', ParseIntPipe) ordre: number,
  ): Promise<CircuitMonument> {
    return this.circuitService.addMonumentToCircuit(
      circuitId,
      monumentId,
      ordre,
    );
  }

  @Delete(':circuitId/monuments/:monumentId')
  removeMonumentFromCircuit(
    @Param('circuitId', ParseIntPipe) circuitId: number,
    @Param('monumentId', ParseIntPipe) monumentId: number,
  ): Promise<boolean> {
    return this.circuitService.removeMonumentFromCircuit(circuitId, monumentId);
  }

  @Patch('monument-order')
  updateMonumentOrder(
    @Body() updateOrderDto: UpdateMonumentOrderDto,
  ): Promise<CircuitMonument> {
    return this.circuitService.updateMonumentOrder(updateOrderDto);
  }

  @Patch('update/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCircuitDto,
  ): Promise<Circuit | null> {
    return this.circuitService.update(id, updateDto);
  }

  @Delete('delete/:id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<Circuit | null> {
    return this.circuitService.remove(id);
  }
}
