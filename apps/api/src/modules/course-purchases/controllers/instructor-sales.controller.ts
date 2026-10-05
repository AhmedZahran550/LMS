import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CoursePurchasesService } from '../course-purchases.service';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { UserRole } from '@lms/shared-types';
import { CoursePurchasesSwagger } from '../../../swagger';

@ApiTags('Instructor Sales & Revenue')
@Controller('instructor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR)
export class InstructorSalesController {
  constructor(private readonly purchasesService: CoursePurchasesService) {}

  @Get('courses/:id/sales')
  @CoursePurchasesSwagger.getCourseSales()
  async getCourseSales(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) courseId: string,
  ) {
    return this.purchasesService.getCourseSales(courseId, user.id);
  }

  @Get('revenue')
  @CoursePurchasesSwagger.getRevenue()
  async getRevenue(@CurrentUser() user: any) {
    return this.purchasesService.getInstructorRevenue(user.id);
  }
}
