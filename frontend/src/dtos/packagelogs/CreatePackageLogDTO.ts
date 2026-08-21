// Internal imports
import type { PackageStatus } from '@/interfaces/PackageInterface';

export interface CreatePackageLogDTO {
  packageId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  previousStatus?: PackageStatus;
  newStatus?: PackageStatus;
  description?: string;
}
