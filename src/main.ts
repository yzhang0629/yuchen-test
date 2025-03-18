import { NestFactory } from '@nestjs/core';
import { DifyModule } from './dify/dify.module';
import { SearchModule } from './es/es.module';
import { DbModule } from './db/db.module';

async function bootstrap() {
  const app = await NestFactory.create(DifyModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
