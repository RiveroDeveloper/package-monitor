// Internal imports
import type { UpdateUserDTO } from '@/dtos/users/UpdateUserDTO';
import type { UserInterface } from '@/interfaces/UserInterface';
import { axiosInstance } from '@/utils/axiosInstance';

export class UserService {
  static async getAll(): Promise<UserInterface[]> {
    const { data } = await axiosInstance.get<UserInterface[]>('users');
    return data;
  }

  static async getById(id: string): Promise<UserInterface> {
    const { data } = await axiosInstance.get<UserInterface>(`users/${id}`);
    return data;
  }

  static async update(
    id: string,
    payload: UpdateUserDTO,
  ): Promise<UserInterface> {
    const { data } = await axiosInstance.patch<UserInterface>(
      `users/${id}`,
      payload,
    );
    return data;
  }

  static async delete(id: string): Promise<void> {
    await axiosInstance.delete(`users/${id}`);
  }
}
