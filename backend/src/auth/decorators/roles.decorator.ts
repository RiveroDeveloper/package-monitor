// External imports
import { SetMetadata } from '@nestjs/common';

// Internal imports
import type { Role } from '../../types/UsersTypes';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
