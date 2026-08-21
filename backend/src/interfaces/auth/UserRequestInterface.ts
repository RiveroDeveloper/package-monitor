// External imports
import type { Request } from 'express';

// Internal imports
import type { Role } from '../../types/UsersTypes';

export interface UserRequestInterface extends Request {
  user: {
    sub: string;
    email: string;
    role: Role;
  };
}
