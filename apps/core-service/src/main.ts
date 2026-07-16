import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ensureSchemaExists } from '@omni/shared';

async function bootstrap() {
  const dbUrl = 'postgresql://postgres:postgrespassword@localhost:5432/omnidrop_db';
  await ensureSchemaExists(dbUrl, 'core');

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3001);
  console.log(`Core Service is running on: ${await app.getUrl()}`);
}
bootstrap();
