/** @author David Hdez, Juan Andrés Young */
// Internal imports
import type { CreatePackageDTO } from "@/dtos/packages/CreatePackageDTO";
import type { PackageInterface } from "@/interfaces/PackageInterface";
import type { UpdatePackageDTO } from "@/dtos/packages/UpdatePackageDTO";
import { axiosInstance } from "@/utils/axiosInstance";

export class PackageService {
  static async getAll(): Promise<PackageInterface[]> {
    const { data } = await axiosInstance.get<PackageInterface[]>("packages");
    return data;
  }

  static async getById(id: string): Promise<PackageInterface> {
    const { data } = await axiosInstance.get<PackageInterface>(
      `packages/${id}`,
    );
    return data;
  }

  static async create(payload: CreatePackageDTO): Promise<PackageInterface> {
    const { data } = await axiosInstance.post<PackageInterface>(
      "packages",
      payload,
    );
    return data;
  }

  static async update(
    id: string,
    payload: UpdatePackageDTO,
  ): Promise<PackageInterface> {
    const { data } = await axiosInstance.patch<PackageInterface>(
      `packages/${id}`,
      payload,
    );
    return data;
  }

  static async delete(id: string): Promise<void> {
    await axiosInstance.delete(`packages/${id}`);
  }
}
