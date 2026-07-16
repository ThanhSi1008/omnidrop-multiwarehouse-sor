import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Fulfillment } from './entities/fulfillment.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgrespassword',
      database: 'omnidrop_db',
      schema: 'order',
      entities: [Order, OrderItem, Fulfillment],
      synchronize: true, // dev only
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
