import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { University } from '../../db/entities/university.entity';
import { UniversitiesService } from './universities.service';
import { PublicUniversitiesController } from './controllers/public-universities.controller';
import { AdminUniversitiesController } from './controllers/admin-universities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([University])],
  controllers: [PublicUniversitiesController, AdminUniversitiesController],
  providers: [UniversitiesService],
  exports: [UniversitiesService],
})
export class UniversitiesModule {}
