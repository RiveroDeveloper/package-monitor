// Internal imports
import type { Role } from '@/interfaces/UserInterface';

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: Role;
  avatarUrl?: string;
}
