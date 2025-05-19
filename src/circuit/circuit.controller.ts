import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CircuitService } from './circuit.service';
import { CreateCircuitDto } from './dto/create-circuit.dto';
import { UpdateCircuitDto } from './dto/update-circuit.dto';
import { Circuit } from './entities/circuit.entity';

@Controller('circuit')
export class CircuitController {
  constructor(private readonly circuitService: CircuitService) {}

  @Post('create')
  create(@Body() createDto: CreateCircuitDto): Promise<Circuit> {
    return this.circuitService.create(createDto);
  }

  @Get('getAll')
  findAll(): Promise<Circuit[]> {
    return this.circuitService.findAll();
  }

  @Get('get/:id')
  findOne(@Param('id') id: string): Promise<Circuit | null> {
    return this.circuitService.findOne(+id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateDto: UpdateCircuitDto): Promise<Circuit | null> {
    return this.circuitService.update(+id, updateDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string): Promise<Circuit | null> {
    return this.circuitService.remove(+id);
  }
}
