// Internal imports
import type { UserInterface } from '@/interfaces/UserInterface';
import type { WarehouseInterface } from '@/interfaces/WarehouseInterface';

export type PackageStatus =
  | 'Pending'
  | 'In Transit'
  | 'Delivered'
  | 'Exception'
  | 'At Warehouse';

export interface PackageInterface {
  id: string;
  description: string;
  status: PackageStatus;
  price: number;
  createdAt: string;
  updatedAt: string;
  user: UserInterface;
  warehouse: WarehouseInterface;
}
