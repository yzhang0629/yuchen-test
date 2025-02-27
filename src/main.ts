import { NestFactory } from '@nestjs/core';
import { DifyModule } from './dify/dify.module';
import { KibanaModule } from './es/es.module';

async function bootstrap() {
  const app = await NestFactory.create(KibanaModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
