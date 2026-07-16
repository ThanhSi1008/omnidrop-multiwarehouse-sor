import { Module } from '@nestjs/common';
import Redis from 'ioredis';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const redisClient = new Redis({
          host: 'localhost',
          port: 6380, // matching host port in docker-compose.yml
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
