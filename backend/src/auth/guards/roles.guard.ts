// External imports
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// Internal imports
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { Role } from '../../types/UsersTypes';
import type { UserRequestInterface } from '../../interfaces/auth/UserRequestInterface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<UserRequestInterface>();

    if (!requiredRoles.includes(request.user.role)) {
      throw new ForbiddenException('Insufficient role to access this resource');
    }

    return true;
  }
}
