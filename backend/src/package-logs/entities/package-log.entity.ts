// External imports
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Internal imports
import { Package } from '../../packages/entities/package.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import type { PackageStatus } from '../../types/PackageTypes';

@Entity()
export class PackageLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  previousStatus: PackageStatus | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  newStatus: PackageStatus | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @CreateDateColumn({ type: 'datetime' })
  timestamp: Date;

  @ManyToOne(() => Package, (packageEntity) => packageEntity.logs, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  package: Package;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.fromWarehouseLogs, {
    eager: true,
  })
  @JoinColumn()
  fromWarehouse: Warehouse;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.toWarehouseLogs, {
    eager: true,
  })
  @JoinColumn()
  toWarehouse: Warehouse;
}
