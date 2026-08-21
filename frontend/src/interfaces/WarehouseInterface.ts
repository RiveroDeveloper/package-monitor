/** @author David Hdez, Juan Andrés Young */
export interface WarehouseInterface {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentLoad: number;
  managerName: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
