import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USERROLES } from '../../utils/enum';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<USERROLES[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; 
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // LOG pour debug complet
    console.log('RoleGuard - user:', JSON.stringify(user), '| required:', requiredRoles);
    console.log('RoleGuard - user.role:', user?.role, '| required:', requiredRoles);

    // Comparaison robuste (insensible à la casse, string ou enum)
    const userRole = (user?.role || user?.userRole || '').toString().toUpperCase();
    const allowedRoles = requiredRoles.map(r => r.toString().toUpperCase());

    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new ForbiddenException('Accès refusé: rôle insuffisant');
    }

    return true;
  }
}
