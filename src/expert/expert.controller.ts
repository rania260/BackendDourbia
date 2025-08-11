import { Controller, Post, Body, Get, Param, Patch, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ExpertService } from './expert.service';
import { CreateExpertDto } from './dto/create-expert.dto';
import { UpdateExpertDto } from './dto/update-expert.dto';

@ApiTags('experts')
@Controller('experts')
export class ExpertController {
  constructor(private readonly expertService: ExpertService) {}

  @Post('add')
  create(@Body() createExpertDto: CreateExpertDto) {
    return this.expertService.createExpert(createExpertDto);
  }

  @Get('getAll')
  findAll() {
    return this.expertService.findAllExperts();
  }

  @Get('search')
  searchExperts(@Query('term') searchTerm: string) {
    return this.expertService.searchExperts(searchTerm);
  }

  @Get('get/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.expertService.findOneExpert(id);
  }

  @Patch('update/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateExpertDto: UpdateExpertDto) {
    return this.expertService.updateExpert(id, updateExpertDto);
  }

  @Delete('delete/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.expertService.deleteExpert(id);
  }

  @Patch('ban/:id')
  ban(@Param('id', ParseIntPipe) id: number, @Body() body: { isBanned: boolean }) {
    return this.expertService.banExpert(id, body.isBanned);
  }
}