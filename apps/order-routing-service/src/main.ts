import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ensureSchemaExists } from '@omni/shared';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const dbUrl = 'postgresql://postgres:postgrespassword@localhost:5432/omnidrop_db';
  await ensureSchemaExists(dbUrl, 'order');

  const app = await NestFactory.create(AppModule);

  // Connect RabbitMQ microservice listener for order creation events
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@localhost:5673'],
      queue: 'order_created_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3003);
  console.log(`Order & Routing Service is running on: ${await app.getUrl()}`);
}
bootstrap();
