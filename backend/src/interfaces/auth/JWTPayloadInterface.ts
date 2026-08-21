// Internal imports
import type { Role } from '../../types/UsersTypes';

export interface JWTPayloadInterface {
  sub: string;
  email: string;
  role: Role;
}
