// Hardcoded warehouse list served by the Nuxt server layer.

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentLoad: number;
  managerName: string;
}

const warehouses: Warehouse[] = [
  {
    id: 'bog-01',
    name: 'Bogotá Hub',
    location: 'Bogotá, Colombia',
    capacity: 1500,
    currentLoad: 1120,
    managerName: 'Lina Rojas',
  },
  {
    id: 'med-01',
    name: 'Medellín Hub',
    location: 'Medellín, Colombia',
    capacity: 900,
    currentLoad: 540,
    managerName: 'Carlos Restrepo',
  },
  {
    id: 'cli-01',
    name: 'Cali Hub',
    location: 'Cali, Colombia',
    capacity: 700,
    currentLoad: 660,
    managerName: 'Andrea Gómez',
  },
  {
    id: 'bar-01',
    name: 'Barranquilla Hub',
    location: 'Barranquilla, Colombia',
    capacity: 600,
    currentLoad: 220,
    managerName: 'Felipe Ávila',
  },
  {
    id: 'bua-01',
    name: 'Buenaventura Port',
    location: 'Buenaventura, Colombia',
    capacity: 2000,
    currentLoad: 1850,
    managerName: 'Mariana Quintero',
  },
];

export default defineEventHandler(() => warehouses);

export { warehouses };
