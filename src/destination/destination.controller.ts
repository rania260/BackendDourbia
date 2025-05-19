import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DestinationService } from './destination.service';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { Destination } from './entities/destination.entity';

@Controller('destination')
export class DestinationController {
  constructor(private readonly destinationService: DestinationService) {}

  @Post('create')
  create(@Body() createDto: CreateDestinationDto): Promise<Destination> {
    return this.destinationService.create(createDto);
  }

  @Get('getAll')
  findAll(): Promise<Destination[]> {
    return this.destinationService.findAll();
  }

  @Get('get/:id')
  findOne(@Param('id') id: string): Promise<Destination | null> {
    return this.destinationService.findOne(+id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateDto: UpdateDestinationDto): Promise<Destination | null> {
    return this.destinationService.update(+id, updateDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string): Promise<Destination | null> {
    return this.destinationService.remove(+id);
  }
}
