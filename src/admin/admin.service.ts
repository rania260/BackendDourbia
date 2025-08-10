import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { User } from '../auth/entities/user.entity';
import { USERROLES } from '../utils/enum';
import {
  DEFAULT_ADMIN_PERMISSIONS,
  SUPER_ADMIN_PERMISSIONS,
} from '../utils/permissions';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Admin[]> {
    return this.adminRepository.find({
      select: [
        'id',
        'email',
        'username',
        'role',
        'permissions',
        'lastLoginAt',
        'isSuperAdmin',
      ],
    });
  }

  async findOne(id: number): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'username',
        'role',
        'permissions',
        'lastLoginAt',
        'isSuperAdmin',
        'notes',
      ],
    });

    if (!admin) {
      throw new NotFoundException(`Admin avec l'ID ${id} introuvable`);
    }

    return admin;
  }

  async updatePermissions(id: number, permissions: string[]): Promise<Admin> {
    const admin = await this.findOne(id);
    admin.permissions = permissions;
    return this.adminRepository.save(admin);
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.adminRepository.update(id, { lastLoginAt: new Date() });
  }

  async promoteUserToAdmin(
    userId: number,
    isSuperAdmin = false,
  ): Promise<Admin> {
    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(
        `Utilisateur avec l'ID ${userId} introuvable`,
      );
    }

    // Vérifier si l'utilisateur n'est pas déjà un admin
    const existingAdmin = await this.adminRepository.findOne({
      where: { id: userId },
    });
    if (existingAdmin) {
      throw new Error('Cet utilisateur est déjà un administrateur');
    }

    // Définir les permissions selon le type d'admin
    const permissions = isSuperAdmin
      ? SUPER_ADMIN_PERMISSIONS
      : DEFAULT_ADMIN_PERMISSIONS;

    // Supprimer l'utilisateur de la table user
    await this.userRepository.delete(userId);

    // Créer le nouvel admin avec les mêmes données
    const admin = new Admin();
    admin.email = user.email;
    admin.username = user.username;
    admin.password = user.password;
    admin.avatar = user.avatar;
    admin.role = USERROLES.ADMIN;
    admin.phone = user.phone;
    admin.country = user.country;
    admin.region = user.region;
    admin.emailVerifiedAt = user.emailVerifiedAt;
    admin.isBanned = user.isBanned;
    admin.googleId = user.googleId;
    admin.permissions = permissions;
    admin.isSuperAdmin = isSuperAdmin;

    return this.adminRepository.save(admin);
  }

  async hasPermission(adminId: number, permission: string): Promise<boolean> {
    const admin = await this.findOne(adminId);
    return admin.isSuperAdmin || admin.permissions.includes(permission);
  }
}
