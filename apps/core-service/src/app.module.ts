import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Warehouse } from './entities/warehouse.entity';
import { Inventory } from './entities/inventory.entity';
import { Bundle } from './entities/bundle.entity';
import { BundleItem } from './entities/bundle-item.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgrespassword',
      database: 'omnidrop_db',
      schema: 'core',
      entities: [Product, ProductVariant, Warehouse, Inventory, Bundle, BundleItem],
      synchronize: true, // dev only
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
