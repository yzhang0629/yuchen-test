import { NestFactory } from '@nestjs/core';
import { DifyModule } from './dify/dify.module';
import { SearchModule } from './es/es.module';
import { DbModule } from './db/db.module';
import { VapiModule } from './vapi/vapi.module';

async function bootstrap() {
  const app = await NestFactory.create(VapiModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
