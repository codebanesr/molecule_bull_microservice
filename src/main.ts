import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { config } from 'dotenv';

config();

async function bootstrap() {
  // hybrid microservice and web application
  const app = await NestFactory.create(AppModule, {
    logger: ['debug']
  });

  app.listen(process.env.BULL_APP_PORT)
}
bootstrap();
