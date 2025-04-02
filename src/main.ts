import { NestFactory } from '@nestjs/core';
import { DifyModule } from './components/dify/dify.module';
import { SearchModule } from './components/es/es.module';
import { DbModule } from './components/db/db.module';
import { VapiModule } from './components/vapi/vapi.module';
import { MainModule } from './main/main.module';

async function bootstrap() {
  const app = await NestFactory.create(MainModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
