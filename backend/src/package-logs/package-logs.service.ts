// External imports
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Internal imports
import { CreatePackageLogDto } from './dto/create-package-log.dto';
import { PackageLog } from './entities/package-log.entity';
import { PackagesService } from '../packages/packages.service';
import { UpdatePackageLogDto } from './dto/update-package-log.dto';
import { WarehousesService } from '../warehouses/warehouses.service';

@Injectable()
export class PackageLogsService {
  constructor(
    @InjectRepository(PackageLog)
    private readonly packageLogsRepository: Repository<PackageLog>,
    private readonly packagesService: PackagesService,
    private readonly warehousesService: WarehousesService,
  ) {}

  async create(createPackageLogDto: CreatePackageLogDto): Promise<PackageLog> {
    const { packageId, fromWarehouseId, toWarehouseId, ...logData } =
      createPackageLogDto;

    if (fromWarehouseId === toWarehouseId) {
      throw new BadRequestException(
        'fromWarehouseId and toWarehouseId must be different',
      );
    }

    const packageEntity = await this.packagesService.findById(packageId);
    const fromWarehouse =
      await this.warehousesService.findById(fromWarehouseId);
    const toWarehouse = await this.warehousesService.findById(toWarehouseId);

    const log = this.packageLogsRepository.create({
      ...logData,
      package: packageEntity,
      fromWarehouse,
      toWarehouse,
    });

    return await this.packageLogsRepository.save(log);
  }

  async findAll(): Promise<PackageLog[]> {
    return await this.packageLogsRepository.find();
  }

  async findById(id: string): Promise<PackageLog> {
    const log = await this.packageLogsRepository.findOneBy({ id });

    if (!log) {
      throw new NotFoundException(`PackageLog ${id} not found`);
    }

    return log;
  }

  async findByPackageId(packageId: string): Promise<PackageLog[]> {
    await this.packagesService.findById(packageId);

    return await this.packageLogsRepository.find({
      where: { package: { id: packageId } },
    });
  }

  async update(
    id: string,
    updatePackageLogDto: UpdatePackageLogDto,
  ): Promise<PackageLog> {
    const { packageId, fromWarehouseId, toWarehouseId, ...logData } =
      updatePackageLogDto;

    const log = await this.packageLogsRepository.preload({
      id,
      ...logData,
    });

    if (!log) {
      throw new NotFoundException(`PackageLog ${id} not found`);
    }

    const nextFromId = fromWarehouseId ?? log.fromWarehouse.id;
    const nextToId = toWarehouseId ?? log.toWarehouse.id;

    if (nextFromId === nextToId) {
      throw new BadRequestException(
        'fromWarehouseId and toWarehouseId must be different',
      );
    }

    if (packageId) {
      log.package = await this.packagesService.findById(packageId);
    }

    if (fromWarehouseId) {
      log.fromWarehouse =
        await this.warehousesService.findById(fromWarehouseId);
    }

    if (toWarehouseId) {
      log.toWarehouse = await this.warehousesService.findById(toWarehouseId);
    }

    return await this.packageLogsRepository.save(log);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.packageLogsRepository.delete(id);
  }
}
