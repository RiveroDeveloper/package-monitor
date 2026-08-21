// External imports
import { PartialType } from '@nestjs/mapped-types';

// Internal imports
import { CreateWarehouseDto } from './create-warehouse.dto';

export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {}
