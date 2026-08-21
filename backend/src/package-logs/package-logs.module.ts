// External imports
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Internal imports
import { PackageLog } from './entities/package-log.entity';
import { PackageLogsController } from './package-logs.controller';
import { PackageLogsService } from './package-logs.service';
import { PackagesModule } from '../packages/packages.module';
import { WarehousesModule } from '../warehouses/warehouses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PackageLog]),
    PackagesModule,
    WarehousesModule,
  ],
  controllers: [PackageLogsController],
  providers: [PackageLogsService],
  exports: [PackageLogsService],
})
export class PackageLogsModule {}
