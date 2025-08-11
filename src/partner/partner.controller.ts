import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PartnerService } from './partner.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@ApiTags('partners')
@Controller('partners')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Post('add')
  create(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnerService.createPartner(createPartnerDto);
  }

  @Get('getAll')
  findAll() {
    return this.partnerService.findAllPartners();
  }

  @Get('search')
  searchPartners(@Query('term') searchTerm: string) {
    return this.partnerService.searchPartners(searchTerm);
  }

  @Patch('update/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePartnerDto: UpdatePartnerDto,
  ) {
    return this.partnerService.updatePartner(id, updatePartnerDto);
  }

  @Delete('delete/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.partnerService.deletePartner(id);
  }

  @Patch('ban/:id')
  ban(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isBanned: boolean },
  ) {
    return this.partnerService.banPartner(id, body.isBanned);
  }
}
