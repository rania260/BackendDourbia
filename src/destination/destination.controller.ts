import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UploadedFiles, Res } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as path from 'path';
import { DestinationService } from './destination.service';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { AssignCircuitsToDestinationDto } from './dto/assign-circuits-to-destination.dto';
import { Destination } from './entities/destination.entity';
import { Circuit } from '../circuit/entities/circuit.entity';
import { CloudinaryService } from './cloudinary.service';
import { multerDestinationOptions } from './multer.config';
import { Public } from '../auth/guards/public.decorator';

@Controller('destination')
export class DestinationController {
  constructor(
    private readonly destinationService: DestinationService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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
  @Public()
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

  @Post('assign-circuits/:id')
  assignCircuits(
    @Param('id') id: string,
    @Body() assignDto: AssignCircuitsToDestinationDto,
  ): Promise<Destination | null> {
    return this.destinationService.assignCircuits(+id, assignDto);
  }

  @Get('available-circuits')
  getAvailableCircuits(): Promise<Circuit[]> {
    return this.destinationService.getAvailableCircuits();
  }

  // === NOUVEAUX ENDPOINTS POUR LES PHOTOS ===

  @Post(':id/photos/upload')
  @UseInterceptors(FilesInterceptor('photos', 10, multerDestinationOptions))
  async uploadPhotos(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      const destinationId = +id;
      const uploadedUrls = await this.cloudinaryService.uploadMultipleImages(
        files,
        'destinations',
      );

      // Sauvegarder chaque URL dans la base de données
      const savedPhotos: any[] = [];
      for (const url of uploadedUrls) {
        const photo = await this.destinationService.addPhoto(
          destinationId,
          url,
        );
        savedPhotos.push(photo);
      }

      return {
        message: `${files.length} photos uploadées avec succès`,
        photos: savedPhotos,
      };
    } catch (error: any) {
      throw new Error(`Erreur upload photos: ${error.message}`);
    }
  }

  @Get(':id/photos')
  async getPhotos(@Param('id') id: string) {
    return this.destinationService.getPhotos(+id);
  }

  @Delete('photos/:photoId')
  async deletePhoto(@Param('photoId') photoId: string) {
    try {
      await this.destinationService.deletePhoto(+photoId);
      
      return { message: 'Photo supprimée avec succès' };
    } catch (error: any) {
      throw new Error(`Erreur suppression photo: ${error?.message || 'Erreur inconnue'}`);
    }
  }
}
