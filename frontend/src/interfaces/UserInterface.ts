/** @author David Hdez, Juan Andrés Young */
export type Role = 'Admin' | 'User';

export interface UserInterface {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
