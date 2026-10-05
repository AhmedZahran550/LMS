import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { PublicCoursesService } from './public-courses.service';
import { PublicCoursesSwagger } from '../../swagger';

@ApiTags('Public Discovery')
@Controller('public')
export class PublicCoursesController {
  constructor(private readonly publicCoursesService: PublicCoursesService) {}

  @Get('courses')
  @PublicCoursesSwagger.findAllCourses()
  async findAllCourses(@Paginate() query: PaginateQuery) {
    return this.publicCoursesService.findAllCourses(query);
  }

  @Get('courses/:id')
  @PublicCoursesSwagger.findCourseById()
  async findCourseById(@Param('id', ParseUUIDPipe) id: string) {
    return this.publicCoursesService.findCourseById(id);
  }

  @Get('instructors')
  @PublicCoursesSwagger.findAllInstructors()
  async findAllInstructors(@Paginate() query: PaginateQuery) {
    return this.publicCoursesService.findAllInstructors(query);
  }

  @Get('instructors/:id')
  @PublicCoursesSwagger.findInstructorById()
  async findInstructorById(@Param('id', ParseUUIDPipe) id: string) {
    return this.publicCoursesService.findInstructorById(id);
  }
}
