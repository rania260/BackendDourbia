import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as path from 'path';
import { CircuitService } from './circuit.service';
import { CreateCircuitDto } from './dto/create-circuit.dto';
import { UpdateCircuitDto } from './dto/update-circuit.dto';
import { CreateCircuitWithMonumentsDto } from './dto/create-circuit-with-monuments.dto';
import { UpdateMonumentOrderDto } from './dto/update-monument-order.dto';
import { Circuit } from './entities/circuit.entity';
import { CircuitMonument } from './entities/circuit-monument.entity';
import { multerCircuitOptions } from './multer.config';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { Public } from '../auth/guards/public.decorator';
import { USERROLES } from '../utils/enum';

@UseGuards(AuthGuard, RoleGuard)
@Controller('circuit')
export class CircuitController {
  constructor(private readonly circuitService: CircuitService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('image', multerCircuitOptions))
  create(
    @Body() createDto: CreateCircuitDto,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<Circuit> {
    return this.circuitService.create(createDto, image);
  }

  @Post('create-with-monuments')
  createWithMonuments(
    @Body() createDto: CreateCircuitWithMonumentsDto,
  ): Promise<Circuit> {
    return this.circuitService.createWithMonuments(createDto);
  }

  @Get('getAll')
  @Public()
  findAll(): Promise<Circuit[]> {
    return this.circuitService.findAll();
  }

  @Get('image/:imageName')
  getImage(@Param('imageName') imageName: string, @Res() res: Response) {
    const imagePath = path.join(
      process.cwd(),
      'uploads',
      'circuits',
      imageName,
    );
    return res.sendFile(imagePath);
  }

  // =============== ENDPOINTS DE GESTION DES PHOTOS CLOUDINARY ===============

  @Get(':id/photos')
  @Public()
  async getPhotos(@Param('id') circuitId: string) {
    return this.circuitService.getPhotos(+circuitId);
  }

  @Post(':id/photos')
  @Roles(USERROLES.ADMIN, USERROLES.EXPERT)
  @UseInterceptors(FileInterceptor('photo', multerCircuitOptions))
  async addPhoto(
    @Param('id') circuitId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.circuitService.addPhoto(+circuitId, file);
  }

  @Delete('photos/:photoId')
  @Roles(USERROLES.ADMIN, USERROLES.EXPERT)
  async deletePhoto(@Param('photoId') photoId: string) {
    return this.circuitService.deletePhoto(+photoId);
  }

  // =============== ENDPOINTS DE GESTION DES AUDIOS CLOUDINARY ===============

  @Get(':id/audios')
  @Public()
  async getAudios(@Param('id') circuitId: string) {
    return this.circuitService.getAudios(+circuitId);
  }

  @Post(':id/audios')
  @Roles(USERROLES.ADMIN, USERROLES.EXPERT)
  @UseInterceptors(FileInterceptor('audio', multerCircuitOptions))
  async addAudio(
    @Param('id') circuitId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.circuitService.addAudio(+circuitId, file);
  }

  @Delete('audios/:audioId')
  @Roles(USERROLES.ADMIN, USERROLES.EXPERT)
  async deleteAudio(@Param('audioId') audioId: string) {
    return this.circuitService.deleteAudio(+audioId);
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
    @Body() body: { ordre?: number },
  ): Promise<CircuitMonument> {
    return this.circuitService.addMonumentToCircuit(
      circuitId,
      monumentId,
      body.ordre,
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
