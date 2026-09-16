import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { PublicCoursesService } from './public-courses.service';

@ApiTags('Public Discovery')
@Controller('public')
export class PublicCoursesController {
  constructor(private readonly publicCoursesService: PublicCoursesService) {}

  @Get('courses')
  @ApiOperation({ summary: 'Browse and search public courses by title, instructor, or category' })
  async findAllCourses(@Paginate() query: PaginateQuery) {
    return this.publicCoursesService.findAllCourses(query);
  }

  @Get('courses/:id')
  @ApiOperation({ summary: 'Get course details with instructor profile and preview lessons' })
  async findCourseById(@Param('id', ParseUUIDPipe) id: string) {
    return this.publicCoursesService.findCourseById(id);
  }

  @Get('instructors')
  @ApiOperation({ summary: 'Search instructors by name or filter by university' })
  async findAllInstructors(@Paginate() query: PaginateQuery) {
    return this.publicCoursesService.findAllInstructors(query);
  }

  @Get('instructors/:id')
  @ApiOperation({ summary: 'Get instructor public profile and their courses' })
  async findInstructorById(@Param('id', ParseUUIDPipe) id: string) {
    return this.publicCoursesService.findInstructorById(id);
  }
}
