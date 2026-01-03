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


  // Enable CORS
  app.enableCors({
    origin: true, // Allow all origins (reflects the request origin)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  const port = process.env.API_PORT || process.env.PORT || 8002;
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);

  Logger.log(
    `🚀 KshaAI API is running on: http://localhost:${port}`
  );
  Logger.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
