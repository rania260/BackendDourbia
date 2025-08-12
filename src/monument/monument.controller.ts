import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Roles } from 'src/auth/guards/roles.decorator';
import { Public } from '../auth/guards/public.decorator';
import { USERROLES } from 'src/utils/enum';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { MonumentService } from './monument.service';
import { CreateMonumentDto } from './dto/create-monument.dto';
import { UpdateMonumentDto } from './dto/update-monument.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { 
  monumentImageStorage, 
  imageFileFilter,
  monumentAudioStorage,
  audioFileFilter 
} from './multer.config';

@UseGuards(AuthGuard, RoleGuard)
@Controller('monument')
export class MonumentController {
  constructor(private readonly monumentService: MonumentService) {}

  @Post('create')
  @Roles(USERROLES.ADMIN, USERROLES.EXPERT)
  @UseInterceptors(
    FileInterceptor('image_panoramique', {
      storage: monumentImageStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  create(
    @Body() createMonumentDto: CreateMonumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.monumentService.create(createMonumentDto, file);
  }

  @Get('getAll')
  @Roles(USERROLES.ADMIN, USERROLES.EXPERT)
  findAll() {
    return this.monumentService.findAll();
  }

  @Get('get/:id')
  @Roles(USERROLES.ADMIN, USERROLES.EXPERT)
  findOne(@Param('id') id: string) {
    return this.monumentService.findOne(+id);
  }

  @Patch('update/:id')
  @Roles(USERROLES.ADMIN, USERROLES.EXPERT)
  @UseInterceptors(
    FileInterceptor('image_panoramique', {
      storage: monumentImageStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateMonumentDto: UpdateMonumentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.monumentService.update(+id, updateMonumentDto, file);
  }

  @Delete('delete/:id')
  @Roles(USERROLES.ADMIN, USERROLES.EXPERT)
  remove(@Param('id') id: string) {
    return this.monumentService.remove(+id);
  }

  @Get('image/:filename')
  @Public()
  getImage(@Param('filename') filename: string, @Res() res: Response) {
    return this.monumentService.getImage(filename, res);
  }

  // Upload audio files
  @Post('upload-audio/:id')
  @Roles(USERROLES.ADMIN, USERROLES.EXPERT)
  @UseInterceptors(
    FileInterceptor('audioFile', {
      storage: monumentAudioStorage,
      fileFilter: audioFileFilter,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    }),
  )
  uploadAudio(
    @Param('id') id: string,
    @Body('language') language: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.monumentService.uploadAudio(+id, language, file);
  }

  // Get audio files
  @Get('audio/:filename')
  @Public()
  getAudio(@Param('filename') filename: string, @Res() res: Response) {
    return this.monumentService.getAudio(filename, res);
  }
}
