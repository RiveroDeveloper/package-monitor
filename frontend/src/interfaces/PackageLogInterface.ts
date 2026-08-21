/** @author David Hdez, Juan Andrés Young */
// Internal imports
import type {
  PackageInterface,
  PackageStatus,
} from '@/interfaces/PackageInterface';
import type { WarehouseInterface } from '@/interfaces/WarehouseInterface';

export interface PackageLogInterface {
  id: string;
  timestamp: string;
  previousStatus: PackageStatus | null;
  newStatus: PackageStatus | null;
  description: string | null;
  package: PackageInterface;
  fromWarehouse: WarehouseInterface;
  toWarehouse: WarehouseInterface;
}
