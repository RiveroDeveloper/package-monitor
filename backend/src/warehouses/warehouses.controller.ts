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
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Warehouse } from './entities/warehouse.entity';
import { WarehousesService } from './warehouses.service';

@UseGuards(AuthGuard)
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  async findAll(): Promise<Warehouse[]> {
    return await this.warehousesService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Warehouse> {
    return await this.warehousesService.findById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  @Post()
  async create(
    @Body() createWarehouseDto: CreateWarehouseDto,
  ): Promise<Warehouse> {
    return await this.warehousesService.create(createWarehouseDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
  ): Promise<Warehouse> {
    return await this.warehousesService.update(id, updateWarehouseDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.warehousesService.remove(id);
  }
}
