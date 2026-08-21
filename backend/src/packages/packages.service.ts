// External imports
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Internal imports
import { CreatePackageDto } from './dto/create-package.dto';
import { Package } from './entities/package.entity';
import { UpdatePackageDto } from './dto/update-package.dto';
import { UsersService } from '../users/users.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import type { Role } from '../types/UsersTypes';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private readonly packagesRepository: Repository<Package>,
    private readonly usersService: UsersService,
    private readonly warehousesService: WarehousesService,
  ) {}

  async create(createPackageDto: CreatePackageDto): Promise<Package> {
    const { userId, warehouseId, ...packageData } = createPackageDto;

    const user = await this.usersService.findById(userId);
    const warehouse = await this.warehousesService.findById(warehouseId);

    const packageEntity = this.packagesRepository.create({
      ...packageData,
      user,
      warehouse,
    });

    return await this.packagesRepository.save(packageEntity);
  }

  async findAll(requestingUserId: string, requestingUserRole: Role): Promise<Package[]> {
    if (requestingUserRole === 'Admin') {
      return await this.packagesRepository.find();
    }
    return await this.packagesRepository.find({
      where: { user: { id: requestingUserId } },
    });
  }

  async findById(id: string): Promise<Package> {
    const packageEntity = await this.packagesRepository.findOneBy({ id });

    if (!packageEntity) {
      throw new NotFoundException(`Package ${id} not found`);
    }

    return packageEntity;
  }

  async update(
    id: string,
    updatePackageDto: UpdatePackageDto,
  ): Promise<Package> {
    const { userId, warehouseId, ...packageData } = updatePackageDto;

    const packageEntity = await this.packagesRepository.preload({
      id,
      ...packageData,
    });

    if (!packageEntity) {
      throw new NotFoundException(`Package ${id} not found`);
    }

    if (userId) {
      packageEntity.user = await this.usersService.findById(userId);
    }

    if (warehouseId) {
      packageEntity.warehouse = await this.warehousesService.findById(warehouseId);
    }

    return await this.packagesRepository.save(packageEntity);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.packagesRepository.delete(id);
  }
}
