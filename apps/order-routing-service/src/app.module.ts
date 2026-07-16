import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Fulfillment } from './entities/fulfillment.entity';

function getProtoPath(relativeProtoPath: string) {
  let root = process.cwd();
  if (root.endsWith('apps/order-routing-service')) {
    root = join(root, '../..');
  }
  return join(root, relativeProtoPath);
}

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
    TypeOrmModule.forFeature([Order, OrderItem, Fulfillment]),
    ClientsModule.register([
      {
        name: 'CORE_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'core',
          protoPath: getProtoPath('libs/shared/proto/core.proto'),
          url: 'localhost:50052',
          loader: {
            keepCase: true, // keepCase inside loader options
          },
        },
      },
      {
        name: 'CORE_SERVICE_MQ',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5673'],
          queue: 'order_paid_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'FLASH_SALE_MQ',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5673'],
          queue: 'order_timeout_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
