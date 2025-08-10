import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';
import { UpdatePermissionsDto, PromoteUserDto } from './dto/admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async findAll(): Promise<Admin[]> {
    return this.adminService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Admin> {
    return this.adminService.findOne(id);
  }

  @Patch(':id/permissions')
  async updatePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionsDto: UpdatePermissionsDto,
  ): Promise<Admin> {
    return this.adminService.updatePermissions(
      id,
      updatePermissionsDto.permissions,
    );
  }

  @Post('promote/:userId')
  async promoteUserToAdmin(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() promoteUserDto: PromoteUserDto = {},
  ): Promise<Admin> {
    return this.adminService.promoteUserToAdmin(
      userId,
      promoteUserDto.isSuperAdmin || false,
    );
  }

  @Get(':id/has-permission/:permission')
  async hasPermission(
    @Param('id', ParseIntPipe) id: number,
    @Param('permission') permission: string,
  ): Promise<{ hasPermission: boolean }> {
    const hasPermission = await this.adminService.hasPermission(id, permission);
    return { hasPermission };
  }
}
