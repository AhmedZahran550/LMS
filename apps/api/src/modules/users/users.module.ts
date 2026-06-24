import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { AdminUsersController } from './controllers/admin-users.controller';
import { ProfileController } from './controllers/profile.controller';
import { User } from './entities/user.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    StorageModule,
  ],
  controllers: [AdminUsersController, ProfileController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
