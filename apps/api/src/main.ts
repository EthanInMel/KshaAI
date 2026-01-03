/**
 * KshaAI API
 * Built with NestJS + Fastify
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app/app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
    })
  );

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  const globalPrefix = 'api';
  // app.setGlobalPrefix(globalPrefix);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: true,
  });

  const port = process.env.API_PORT || process.env.PORT || 8001;
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);

  Logger.log(
    `🚀 KshaAI API is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
