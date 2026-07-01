import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CourseAssignment } from '../../../db/entities/course-assignment.entity';
import { InstructorStudent } from '../../../db/entities/instructor-student.entity';
import { Course } from '../../../db/entities/course.entity';
import { User } from '../../../db/entities/user.entity';
import { InstructorStudentStatus } from '@lms/shared-types';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class CourseAssignmentsService {
  constructor(
    @InjectRepository(CourseAssignment)
    private readonly assignmentRepo: Repository<CourseAssignment>,
    @InjectRepository(InstructorStudent)
    private readonly instructorStudentRepo: Repository<InstructorStudent>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  async assign(instructorId: string, studentId: string, courseIds?: string[]) {
    const link = await this.instructorStudentRepo.findOne({
      where: { studentId, instructorId, status: InstructorStudentStatus.ACTIVE },
    });
    if (!link) throw new NotFoundException('Student link not found');

    await this.assignmentRepo.delete({ instructorStudentId: link.id });

    let saved: CourseAssignment[] = [];

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
      saved = await this.assignmentRepo.save(assignments);
    } else if (!courseIds) {
      const courses = await this.courseRepo.find({ where: { instructorId } });
      const assignments = courses.map((course) =>
        this.assignmentRepo.create({
          instructorStudentId: link.id,
          courseId: course.id,
        }),
      );
      saved = await this.assignmentRepo.save(assignments);
    }

    if (saved.length > 0) {
      await this.sendAssignmentEmail(instructorId, studentId, saved);
    }

    return saved;
  }

  private async sendAssignmentEmail(instructorId: string, studentId: string, assignments: CourseAssignment[]) {
    const [instructor, student] = await Promise.all([
      this.userRepo.findOne({ where: { id: instructorId } }),
      this.userRepo.findOne({ where: { id: studentId } }),
    ]);
    if (!instructor || !student) return;

    const courseIds = assignments.map((a) => a.courseId);
    const courses = await this.courseRepo.find({ where: { id: In(courseIds) } });
    const courseNames = courses.map((c) => c.title);

    const instructorName = `${instructor.firstName} ${instructor.lastName}`;
    const studentName = `${student.firstName} ${student.lastName}`;

    await this.mailService.sendCourseAssignment(
      student.email,
      studentName,
      instructorName,
      courseNames,
    );
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
