import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as path from 'path';
import { DestinationService } from './destination.service';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { Destination } from './entities/destination.entity';
import { multerDestinationOptions } from './multer.config';

@Controller('destination')
export class DestinationController {
  constructor(private readonly destinationService: DestinationService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('image', multerDestinationOptions))
  create(
    @Body() createDto: CreateDestinationDto,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<Destination> {
    return this.destinationService.create(createDto, image);
  }

  @Get('getAll')
  findAll(): Promise<Destination[]> {
    return this.destinationService.findAll();
  }

  @Get('image/:imageName')
  getImage(@Param('imageName') imageName: string, @Res() res: Response) {
    const imagePath = path.join(process.cwd(), 'uploads', 'destinations', imageName);
    return res.sendFile(imagePath);
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
