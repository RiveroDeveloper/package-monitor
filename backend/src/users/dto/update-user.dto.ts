// External imports
import { PartialType } from '@nestjs/mapped-types';

// Internal imports
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
