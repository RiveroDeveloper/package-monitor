// External imports
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Internal imports
import { User } from '../../users/entities/user.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import type { PackageLog } from '../../package-logs/entities/package-log.entity';
import type { PackageStatus } from '../../types/PackageTypes';

@Entity()
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'varchar', length: 20 })
  status: PackageStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.packages, { eager: true })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.packages, {
    eager: true,
  })
  @JoinColumn()
  warehouse: Warehouse;

  @OneToMany('PackageLog', 'package')
  logs: PackageLog[];
}
