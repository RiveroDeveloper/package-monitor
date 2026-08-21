// External imports
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

// Internal imports
import { AuthGuard } from '../auth/auth.guard';
import { CreatePackageDto } from './dto/create-package.dto';
import { Package } from './entities/package.entity';
import { PackagesService } from './packages.service';
import { UpdatePackageDto } from './dto/update-package.dto';
import type { UserRequestInterface } from '../interfaces/auth/UserRequestInterface';

@UseGuards(AuthGuard)
@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  async findAll(@Request() req: UserRequestInterface): Promise<Package[]> {
    return await this.packagesService.findAll(req.user.sub, req.user.role);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Package> {
    return await this.packagesService.findById(id);
  }

  @Post()
  async create(@Body() createPackageDto: CreatePackageDto): Promise<Package> {
    return await this.packagesService.create(createPackageDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePackageDto: UpdatePackageDto,
  ): Promise<Package> {
    return await this.packagesService.update(id, updatePackageDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.packagesService.remove(id);
  }
}
