// External imports
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

// Internal imports
import { AuthGuard } from '../auth/auth.guard';
import { CreatePackageLogDto } from './dto/create-package-log.dto';
import { PackageLog } from './entities/package-log.entity';
import { PackageLogsService } from './package-logs.service';
import { UpdatePackageLogDto } from './dto/update-package-log.dto';

@UseGuards(AuthGuard)
@Controller('package-logs')
export class PackageLogsController {
  constructor(private readonly packageLogsService: PackageLogsService) {}

  @Get()
  async findAll(): Promise<PackageLog[]> {
    return await this.packageLogsService.findAll();
  }

  @Get('by-package/:packageId')
  async findByPackageId(
    @Param('packageId') packageId: string,
  ): Promise<PackageLog[]> {
    return await this.packageLogsService.findByPackageId(packageId);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<PackageLog> {
    return await this.packageLogsService.findById(id);
  }

  @Post()
  async create(
    @Body() createPackageLogDto: CreatePackageLogDto,
  ): Promise<PackageLog> {
    return await this.packageLogsService.create(createPackageLogDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePackageLogDto: UpdatePackageLogDto,
  ): Promise<PackageLog> {
    return await this.packageLogsService.update(id, updatePackageLogDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.packageLogsService.remove(id);
  }
}
