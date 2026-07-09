import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';

import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { DBExceptionFilter } from './core/filters/query-failed-exception.filter';

import { DatabaseModule } from './db/database.module';
import { AuthModule } from './core/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { StorageModule } from './modules/storage/storage.module';
import { LogsModule } from './modules/logs/logs.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { I18nModule } from './i18n/i18n.module';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import mailConfig from './config/mail.config';
import storageConfig from './config/storage.config';
import oauthConfig from './config/oauth.config';
import firebaseConfig from './config/firebase.config';
import { PushNotificationsModule } from './modules/push-notifications/push-notifications.module';

import { AdminApiModule } from './api/admin/admin-api.module';
import { InstructorApiModule } from './api/instructor/instructor-api.module';
import { LearnerApiModule } from './api/learner/learner-api.module';
import { AppController } from './app.controller';
import { LoggerMiddleware } from './core/middlewares/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, mailConfig, storageConfig, oauthConfig, firebaseConfig],
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    MailModule,
    StorageModule,
    LogsModule,
    I18nModule,
    SubscriptionsModule,
    AdminApiModule,
    InstructorApiModule,
    LearnerApiModule,
    PushNotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    GlobalExceptionFilter,
    {
      provide: APP_FILTER,
      useExisting: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DBExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
