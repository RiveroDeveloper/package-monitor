// External imports
import { PartialType } from '@nestjs/mapped-types';

// Internal imports
import { CreatePackageLogDto } from './create-package-log.dto';

export class UpdatePackageLogDto extends PartialType(CreatePackageLogDto) {}
