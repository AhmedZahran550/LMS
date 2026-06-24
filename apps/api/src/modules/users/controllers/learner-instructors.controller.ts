import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { UsersService } from '../users.service';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { UserRole } from '@lms/shared-types';

@Controller('learner/instructors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.LEARNER)
export class LearnerInstructorsController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Paginate() query: PaginateQuery) {
    return this.usersService.findAll({
      ...query,
      where: { role: UserRole.INSTRUCTOR },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user: any = await this.usersService.findByIdOrFail(id);
    
    // Ensure the user being fetched is actually an instructor
    if (user.role !== UserRole.INSTRUCTOR) {
      throw new Error('User is not an instructor');
    }

    // Strip sensitive information
    const { password, hashedRefreshToken, emailVerificationToken, resetPasswordToken, ...safeUser } = user;
    return safeUser;
  }
}
