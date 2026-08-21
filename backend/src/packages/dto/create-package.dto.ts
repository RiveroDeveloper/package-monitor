// External imports
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// Internal imports
import type { PackageStatus } from '../../types/PackageTypes';

const PACKAGE_STATUSES: PackageStatus[] = [
  'Pending',
  'In Transit',
  'Delivered',
  'Exception',
  'At Warehouse',
];

export class CreatePackageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @IsString()
  @IsIn(PACKAGE_STATUSES)
  status: PackageStatus;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsUUID('4')
  userId: string;

  @IsNotEmpty()
  @IsUUID('4')
  warehouseId: string;
}
