// External imports
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Internal imports
import { AuthModule } from './auth/auth.module';
import { PackageLogsModule } from './package-logs/package-logs.module';
import { PackagesModule } from './packages/packages.module';
import { UsersModule } from './users/users.module';
import { WarehousesModule } from './warehouses/warehouses.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.SQLITE_PATH ?? 'database.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    WarehousesModule,
    PackagesModule,
    PackageLogsModule,
  ],
})
export class AppModule {}
