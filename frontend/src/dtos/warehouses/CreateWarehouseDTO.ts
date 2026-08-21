export interface CreateWarehouseDTO {
  name: string;
  location: string;
  capacity: number;
  currentLoad?: number;
  managerName: string;
  imageUrl?: string;
}
