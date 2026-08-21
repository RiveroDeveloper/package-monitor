// External imports
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Internal imports
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Warehouse } from './entities/warehouse.entity';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private warehousesRepository: Repository<Warehouse>,
  ) {}

  async findAll(): Promise<Warehouse[]> {
    return await this.warehousesRepository.find();
  }

  async findById(id: string): Promise<Warehouse> {
    const warehouse = await this.warehousesRepository.findOneBy({ id });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse #${id} not found`);
    }

    return warehouse;
  }

  async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
    const warehouse = this.warehousesRepository.create(createWarehouseDto);
    return await this.warehousesRepository.save(warehouse);
  }

  async update(
    id: string,
    updateWarehouseDto: UpdateWarehouseDto,
  ): Promise<Warehouse> {
    await this.findById(id);
    await this.warehousesRepository.update(id, updateWarehouseDto);
    return await this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.warehousesRepository.delete(id);
  }
}
