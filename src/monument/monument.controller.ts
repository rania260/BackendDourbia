import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/guards/roles.decorator';
import { USERROLES } from 'src/utils/enum';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { MonumentService } from './monument.service';
import { CreateMonumentDto } from './dto/create-monument.dto';
import { UpdateMonumentDto } from './dto/update-monument.dto';

import { AuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(AuthGuard, RoleGuard)
@Controller('monument')
export class MonumentController {
  constructor(private readonly monumentService: MonumentService) {}

  @Post('add')
  @Roles(USERROLES.ADMIN, USERROLES.EXPERT)
  create(@Body() createMonumentDto: CreateMonumentDto) {
    return this.monumentService.create(createMonumentDto);
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
  update(@Param('id') id: string, @Body() updateMonumentDto: UpdateMonumentDto) {
    return this.monumentService.update(+id, updateMonumentDto);
  }

  @Delete('delete/:id')
  @Roles(USERROLES.ADMIN, USERROLES.EXPERT)
  remove(@Param('id') id: string) {
    return this.monumentService.remove(+id);
  }
}
