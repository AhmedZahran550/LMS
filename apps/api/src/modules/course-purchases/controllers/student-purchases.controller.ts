import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { CoursePurchasesService } from '../course-purchases.service';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { UserRole } from '@lms/shared-types';
import { CoursePurchasesSwagger } from '../../../swagger';

@ApiTags('Learner Purchases & Courses')
@Controller('learner')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.LEARNER)
export class StudentPurchasesController {
  constructor(private readonly purchasesService: CoursePurchasesService) {}

  @Post('courses/:id/purchase')
  @CoursePurchasesSwagger.purchaseCourse()
  async purchaseCourse(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) courseId: string,
  ) {
    return this.purchasesService.initiatePurchase(user.id, courseId);
  }

  @Get('my-courses')
  @CoursePurchasesSwagger.getMyCourses()
  async getMyCourses(
    @CurrentUser() user: any,
    @Paginate() query: PaginateQuery,
  ) {
    return this.purchasesService.getStudentCourses(user.id, query);
  }

  @Get('my-courses/:id')
  @CoursePurchasesSwagger.getMyCourseById()
  async getMyCourseById(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) courseId: string,
  ) {
    return this.purchasesService.getStudentCourseById(user.id, courseId);
  }
}
