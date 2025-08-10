import { IsArray, IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdatePermissionsDto {
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}

export class PromoteUserDto {
  @IsOptional()
  @IsBoolean()
  isSuperAdmin?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAdminDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsBoolean()
  isSuperAdmin?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
