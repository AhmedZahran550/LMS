import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './db/datasource';
import { AuthModule } from './core/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { StorageModule } from './modules/storage/storage.module';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import mailConfig from './config/mail.config';
import storageConfig from './config/storage.config';

import { AdminApiModule } from './api/admin/admin-api.module';
import { InstructorApiModule } from './api/instructor/instructor-api.module';
import { LearnerApiModule } from './api/learner/learner-api.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, mailConfig, storageConfig],
      envFilePath: '.env', // API specific .env
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    AuthModule,
    MailModule,
    StorageModule,
    AdminApiModule,
    InstructorApiModule,
    LearnerApiModule,
    RouterModule.register([
      {
        path: 'api',
        children: [
          { path: 'admin', module: AdminApiModule },
          { path: 'instructor', module: InstructorApiModule },
          { path: 'learner', module: LearnerApiModule },
        ],
      },
    ]),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
