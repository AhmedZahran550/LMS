import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './db/database.module';
import { AuthModule } from './core/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { StorageModule } from './modules/storage/storage.module';
import { LogsModule } from './modules/logs/logs.module';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import mailConfig from './config/mail.config';
import storageConfig from './config/storage.config';

import { AdminApiModule } from './api/admin/admin-api.module';
import { InstructorApiModule } from './api/instructor/instructor-api.module';
import { LearnerApiModule } from './api/learner/learner-api.module';
import { AppController } from './app.controller';
import { LoggerMiddleware } from './core/middlewares/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, mailConfig, storageConfig],
      envFilePath: '.env', // API specific .env
    }),
    DatabaseModule,
    AuthModule,
    MailModule,
    StorageModule,
    LogsModule,
    AdminApiModule,
    InstructorApiModule,
    LearnerApiModule,

  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

