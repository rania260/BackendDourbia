import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UnauthorizedException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './multer.config';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post('add')
  @UseGuards(AuthGuard('jwt')) 
  @ApiBearerAuth('access-token')
  create(@Request() req, @Body() createServiceDto: CreateServiceDto) {
    console.log('User dans req:', req.user);
    if (!req.user) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    const partnerId = req.user.id;
    return this.serviceService.create(createServiceDto, partnerId);
  }

  @Get('getAll')
  findAll() {
    return this.serviceService.findAll();
  }

  @Get('my-services')
  @UseGuards(AuthGuard('jwt')) 
  @ApiBearerAuth('access-token')
  findMyServices(@Request() req) {
    if (!req.user) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    const partnerId = req.user.id;
    return this.serviceService.findByPartnerId(partnerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceService.findOne(id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateDto: CreateServiceDto) {
    return this.serviceService.update(id, updateDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.serviceService.remove(id);
  }

  // =============== ENDPOINTS DE GESTION DES PHOTOS ===============

  @Post(':id/photos')
  @UseInterceptors(FileInterceptor('photo', multerConfig))
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  async addPhoto(
    @Param('id') serviceId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.serviceService.addPhoto(serviceId, file);
  }

  @Get(':id/photos')
  async getPhotos(@Param('id') serviceId: string) {
    return this.serviceService.getPhotos(serviceId);
  }

  @Delete('photos/:photoId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  async deletePhoto(@Param('photoId') photoId: string) {
    return this.serviceService.deletePhoto(+photoId);
  }
}
