import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CourseAssignment } from '../../../db/entities/course-assignment.entity';
import { InstructorStudent } from '../../../db/entities/instructor-student.entity';
import { Course } from '../../../db/entities/course.entity';
import { InstructorStudentStatus } from '@lms/shared-types';

@Injectable()
export class CourseAssignmentsService {
  constructor(
    @InjectRepository(CourseAssignment)
    private readonly assignmentRepo: Repository<CourseAssignment>,
    @InjectRepository(InstructorStudent)
    private readonly instructorStudentRepo: Repository<InstructorStudent>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) {}

  async assign(instructorId: string, studentId: string, courseIds?: string[]) {
    const link = await this.instructorStudentRepo.findOne({
      where: { studentId, instructorId, status: InstructorStudentStatus.ACTIVE },
    });
    if (!link) throw new NotFoundException('Student link not found');

    await this.assignmentRepo.delete({ instructorStudentId: link.id });

    if (courseIds && courseIds.length > 0) {
      const courses = await this.courseRepo.find({ where: { id: In(courseIds) } });
      const assignments = courses
        .filter((c) => c.instructorId === instructorId)
        .map((course) =>
          this.assignmentRepo.create({
            instructorStudentId: link.id,
            courseId: course.id,
          }),
        );
      return this.assignmentRepo.save(assignments);
    }

    if (!courseIds) {
      const courses = await this.courseRepo.find({ where: { instructorId } });
      const assignments = courses.map((course) =>
        this.assignmentRepo.create({
          instructorStudentId: link.id,
          courseId: course.id,
        }),
      );
      return this.assignmentRepo.save(assignments);
    }

    return [];
  }

  async getAssignments(instructorId: string, studentId: string) {
    const link = await this.instructorStudentRepo.findOne({
      where: { studentId, instructorId, status: InstructorStudentStatus.ACTIVE },
    });
    if (!link) throw new NotFoundException('Student link not found');

    const assignments = await this.assignmentRepo.find({
      where: { instructorStudentId: link.id },
    });
    return { courseIds: assignments.map((a) => a.courseId) };
  }
}
