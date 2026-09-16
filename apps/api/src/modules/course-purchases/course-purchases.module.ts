import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursePurchase } from '../../db/entities/course-purchase.entity';
import { Course } from '../../db/entities/course.entity';
import { User } from '../../db/entities/user.entity';
import { CoursePurchasesService } from './course-purchases.service';
import { StudentPurchasesController } from './controllers/student-purchases.controller';
import { InstructorSalesController } from './controllers/instructor-sales.controller';
import { PaymentsModule } from '../payments/payments.module';
import { SystemConfigModule } from '../system-config/system-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CoursePurchase, Course, User]),
    PaymentsModule,
    SystemConfigModule,
  ],
  controllers: [StudentPurchasesController, InstructorSalesController],
  providers: [CoursePurchasesService],
  exports: [CoursePurchasesService],
})
export class CoursePurchasesModule {}
