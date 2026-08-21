// External imports
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  location: string;

  @IsInt()
  @Min(0)
  capacity: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  currentLoad: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  managerName: string;

  @IsString()
  @IsOptional()
  imageUrl: string;
}
