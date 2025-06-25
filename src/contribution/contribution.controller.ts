import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ContributionService } from './contribution.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@ApiTags('Contributions')
@ApiBearerAuth('access-token')
@Controller('contributions')
export class ContributionController {
  constructor(private readonly contributionService: ContributionService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/contributions',
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + file.originalname;
          callback(null, uniqueName);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['text', 'image', 'video', 'pdf'] },
        text: { type: 'string' },
        monumentId: { type: 'number' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateContributionDto,
    @Request() req,
  ) {
    const userId = req.user.id;

    // Validation : text obligatoire si type = text
    if (body.type === 'text' && !body.text) {
      throw new BadRequestException("Le champ 'text' est requis pour le type 'text'.");
    }

    return this.contributionService.create(body, userId, file);
  }

  @Get('getAll')
  async getAll() {
    return this.contributionService.findAll();
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.contributionService.delete(id);
  }
}
