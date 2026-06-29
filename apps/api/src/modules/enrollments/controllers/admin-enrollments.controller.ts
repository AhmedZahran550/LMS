import { Controller, Get, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../../../db/entities/enrollment.entity';
import { RespondEnrollmentDto } from '../dto/respond-enrollment.dto';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { UserRole, PaginatedResponse } from '@lms/shared-types';
import { EnrollmentsSwagger } from '../../../swagger/enrollments.swagger';

@ApiTags("Admin Enrollments")
@Controller('admin/enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminEnrollmentsController {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
  ) {}

  @Get()
  @EnrollmentsSwagger.findAllEnrollments()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [enrollments, total] = await this.enrollmentsRepository.findAndCount({
      skip,
      take: limitNum,
      relations: ['learner', 'course'],
      order: { createdAt: 'DESC' },
    });

    const result: Omit<PaginatedResponse<any>, 'success' | 'message'> = {
      data: enrollments.map(e => {
        if (e.learner) {
          const { password, hashedRefreshToken, ...safeLearner } = e.learner;
          e.learner = safeLearner as any;
        }
        return e;
      }),
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
    return result;
  }

  @Patch(':id')
  @EnrollmentsSwagger.updateEnrollment()
  async update(@Param('id') id: string, @Body() respondDto: RespondEnrollmentDto) {
    const enrollment = await this.enrollmentsRepository.findOne({ where: { id } });
    if (enrollment) {
      enrollment.status = respondDto.status;
      return this.enrollmentsRepository.save(enrollment);
    }
    return null;
  }
}
