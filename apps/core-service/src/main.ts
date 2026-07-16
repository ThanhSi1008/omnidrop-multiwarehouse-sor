import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ensureSchemaExists } from '@omni/shared';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

function getProtoPath(relativeProtoPath: string) {
  let root = process.cwd();
  if (root.endsWith('apps/core-service')) {
    root = join(root, '../..');
  }
  return join(root, relativeProtoPath);
}

async function bootstrap() {
  const dbUrl = 'postgresql://postgres:postgrespassword@localhost:5432/omnidrop_db';
  await ensureSchemaExists(dbUrl, 'core');

  const app = await NestFactory.create(AppModule);

  // Connect gRPC microservice with keepCase: true inside loader settings
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'core',
      protoPath: getProtoPath('libs/shared/proto/core.proto'),
      url: '0.0.0.0:50052',
      loader: {
        keepCase: true,
      },
    },
  });

  // Connect RabbitMQ microservice listener for payment events (Saga paid)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@localhost:5673'],
      queue: 'order_paid_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3001);
  console.log(`Core Service is running on: ${await app.getUrl()}`);
}
bootstrap();
