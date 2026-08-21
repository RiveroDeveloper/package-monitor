/** @author David Hdez, Juan Andrés Young */
// Internal imports
import type { CreatePackageLogDTO } from '@/dtos/packagelogs/CreatePackageLogDTO';
import type { PackageLogInterface } from '@/interfaces/PackageLogInterface';
import type { UpdatePackageLogDTO } from '@/dtos/packagelogs/UpdatePackageLogDTO';
import { axiosInstance } from '@/utils/axiosInstance';

export class PackageLogService {
  static async getAll(): Promise<PackageLogInterface[]> {
    const { data } = await axiosInstance.get<PackageLogInterface[]>(
      'package-logs',
    );
    return data;
  }

  static async getById(id: string): Promise<PackageLogInterface> {
    const { data } = await axiosInstance.get<PackageLogInterface>(
      `package-logs/${id}`,
    );
    return data;
  }

  static async getByPackageId(
    packageId: string,
  ): Promise<PackageLogInterface[]> {
    const { data } = await axiosInstance.get<PackageLogInterface[]>(
      `package-logs/by-package/${packageId}`,
    );
    return data;
  }

  static async create(
    payload: CreatePackageLogDTO,
  ): Promise<PackageLogInterface> {
    const { data } = await axiosInstance.post<PackageLogInterface>(
      'package-logs',
      payload,
    );
    return data;
  }

  static async update(
    id: string,
    payload: UpdatePackageLogDTO,
  ): Promise<PackageLogInterface> {
    const { data } = await axiosInstance.patch<PackageLogInterface>(
      `package-logs/${id}`,
      payload,
    );
    return data;
  }

  static async delete(id: string): Promise<void> {
    await axiosInstance.delete(`package-logs/${id}`);
  }
}
