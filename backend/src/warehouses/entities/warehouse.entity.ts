// External imports
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Internal imports
import type { Package } from '../../packages/entities/package.entity';
import type { PackageLog } from '../../package-logs/entities/package-log.entity';

@Entity()
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  currentLoad: number;

  @Column({ type: 'varchar', length: 255 })
  managerName: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @OneToMany('Package', 'warehouse')
  packages: Package[];

  @OneToMany('PackageLog', 'fromWarehouse')
  fromWarehouseLogs: PackageLog[];

  @OneToMany('PackageLog', 'toWarehouse')
  toWarehouseLogs: PackageLog[];
}
