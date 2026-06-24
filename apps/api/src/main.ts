import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { DBExceptionFilter } from './core/filters/query-failed-exception.filter';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: '*', // Adjust in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Register filters (last registered is evaluated first)
  app.useGlobalFilters(
    new GlobalExceptionFilter(),
    new DBExceptionFilter(),
  );

  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = configService.get<number>('app.port', 5000);
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();

