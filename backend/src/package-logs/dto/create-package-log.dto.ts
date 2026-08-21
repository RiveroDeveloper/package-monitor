// External imports
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

// Internal imports
import type { PackageStatus } from '../../types/PackageTypes';

const PACKAGE_STATUSES: PackageStatus[] = [
  'Pending',
  'In Transit',
  'Delivered',
  'Exception',
  'At Warehouse',
];

export class CreatePackageLogDto {
  @IsNotEmpty()
  @IsUUID('4')
  packageId: string;

  @IsNotEmpty()
  @IsUUID('4')
  fromWarehouseId: string;

  @IsNotEmpty()
  @IsUUID('4')
  toWarehouseId: string;

  @IsOptional()
  @IsString()
  @IsIn(PACKAGE_STATUSES)
  previousStatus?: PackageStatus;

  @IsOptional()
  @IsString()
  @IsIn(PACKAGE_STATUSES)
  newStatus?: PackageStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
