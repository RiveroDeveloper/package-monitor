/** @author David Hdez, Juan Andrés Young */
// Internal imports
import type { PackageStatus } from '@/interfaces/PackageInterface';

export interface CreatePackageDTO {
  description: string;
  status: PackageStatus;
  price: number;
  userId: string;
  warehouseId: string;
}
