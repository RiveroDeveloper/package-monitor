/** @author David Hdez, Juan Andrés Young */
// Internal imports
import type { CreateWarehouseDTO } from '@/dtos/warehouses/CreateWarehouseDTO';
import type { UpdateWarehouseDTO } from '@/dtos/warehouses/UpdateWarehouseDTO';
import type { WarehouseInterface } from '@/interfaces/WarehouseInterface';
import { axiosInstance } from '@/utils/axiosInstance';

export class WarehouseService {
  static async getAll(): Promise<WarehouseInterface[]> {
    const { data } = await axiosInstance.get<WarehouseInterface[]>('warehouses');
    return data;
  }

  static async getById(id: string): Promise<WarehouseInterface> {
    const { data } = await axiosInstance.get<WarehouseInterface>(
      `warehouses/${id}`,
    );
    return data;
  }

  static async create(
    payload: CreateWarehouseDTO,
  ): Promise<WarehouseInterface> {
    const { data } = await axiosInstance.post<WarehouseInterface>(
      'warehouses',
      payload,
    );
    return data;
  }

  static async update(
    id: string,
    payload: UpdateWarehouseDTO,
  ): Promise<WarehouseInterface> {
    const { data } = await axiosInstance.patch<WarehouseInterface>(
      `warehouses/${id}`,
      payload,
    );
    return data;
  }

  static async delete(id: string): Promise<void> {
    await axiosInstance.delete(`warehouses/${id}`);
  }
}
