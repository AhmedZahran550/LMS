import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { CoursePurchasesService } from '../course-purchases.service';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { UserRole } from '@lms/shared-types';

@ApiTags('Learner Purchases & Courses')
@Controller('learner')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.LEARNER)
export class StudentPurchasesController {
  constructor(private readonly purchasesService: CoursePurchasesService) {}

  @Post('courses/:id/purchase')
  @ApiOperation({ summary: 'Purchase a course via Kashier or enroll instantly if free' })
  async purchaseCourse(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) courseId: string,
  ) {
    return this.purchasesService.initiatePurchase(user.id, courseId);
  }

  @Get('my-courses')
  @ApiOperation({ summary: 'Get all courses purchased by logged-in student' })
  async getMyCourses(
    @CurrentUser() user: any,
    @Paginate() query: PaginateQuery,
  ) {
    return this.purchasesService.getStudentCourses(user.id, query);
  }

  @Get('my-courses/:id')
  @ApiOperation({ summary: 'Get full course details and all contents for purchased course' })
  async getMyCourseById(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) courseId: string,
  ) {
    return this.purchasesService.getStudentCourseById(user.id, courseId);
  }
}
