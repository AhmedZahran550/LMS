import {  Controller, Get, Param, UseGuards , ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { UsersService } from '../users.service';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { UserRole } from '@lms/shared-types';
import { UsersSwagger } from '../../../swagger/users.swagger';

@ApiTags("Learner Instructors")
@Controller('learner/instructors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.LEARNER)
export class LearnerInstructorsController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UsersSwagger.findAllInstructors()
  async findAll(@Paginate() query: PaginateQuery) {
    return this.usersService.findAll({
      ...query,
      where: { role: UserRole.INSTRUCTOR },
    });
  }

  @Get(':id')
  @UsersSwagger.findOneInstructor()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user: any = await this.usersService.findByIdOrFail(id);
    
    if (user.role !== UserRole.INSTRUCTOR) {
      throw new Error('User is not an instructor');
    }

    const { password, hashedRefreshToken, emailVerificationToken, resetPasswordToken, ...safeUser } = user;
    return safeUser;
  }
}
