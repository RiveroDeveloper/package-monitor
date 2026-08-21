// External imports
import { PartialType } from '@nestjs/mapped-types';

// Internal imports
import { CreatePackageDto } from './create-package.dto';

export class UpdatePackageDto extends PartialType(CreatePackageDto) {}
