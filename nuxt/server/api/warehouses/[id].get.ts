import { warehouses } from '../warehouses.get';

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id');
  const warehouse = warehouses.find((warehouse) => warehouse.id === id);

  if (!warehouse) {
    throw createError({
      statusCode: 404,
      statusMessage: `Warehouse ${id} not found`,
    });
  }

  return warehouse;
});
