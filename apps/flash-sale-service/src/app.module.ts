import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import Redis from 'ioredis';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE_MQ',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5673'],
          queue: 'order_created_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const redisClient = new Redis({
          host: 'localhost',
          port: 6380,
        });
        redisClient.on('connect', () => {
          console.log('Connected to Redis successfully.');
        });
        redisClient.on('error', (err) => {
          console.error('Redis connection error:', err);
        });
        return redisClient;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class AppModule {}
