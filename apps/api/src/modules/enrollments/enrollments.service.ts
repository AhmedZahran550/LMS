import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginateConfig, FilterOperator } from 'nestjs-paginate';
import { DBService } from '../../db/db.service';
import { Enrollment } from '../../db/entities/enrollment.entity';
import { RespondEnrollmentDto } from './dto/respond-enrollment.dto';
import { InviteLearnerDto } from './dto/invite-learner.dto';
import { CoursesService } from '../courses/courses.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { I18nService } from 'nestjs-i18n';
import { EnrollmentStatus, CourseVisibility, NotificationType } from '@lms/shared-types';

export const ENROLLMENT_PAGINATION_CONFIG: PaginateConfig<Enrollment> = {
  sortableColumns: ['createdAt', 'status'],
  nullSort: 'last',
  defaultSortBy: [['createdAt', 'DESC']],
  searchableColumns: [],
  filterableColumns: {
    status: [FilterOperator.EQ],
    courseId: [FilterOperator.EQ],
    learnerId: [FilterOperator.EQ],
  },
  relations: ['course', 'learner', 'course.instructor']
};

@Injectable()
export class EnrollmentsService extends DBService<Enrollment> {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentsRepository: Repository<Enrollment>,
    private readonly coursesService: CoursesService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly i18nService: I18nService,
  ) {
    super(enrollmentsRepository, ENROLLMENT_PAGINATION_CONFIG);
  }

  async requestEnrollment(learnerId: string, courseId: string): Promise<Enrollment> {
    const course = await this.coursesService.findById(courseId);

    if (course.visibility === CourseVisibility.PRIVATE) {
      throw new ForbiddenException('Cannot request enrollment to a private course');
    }

    const existing = await this.enrollmentsRepository.findOne({ where: { learnerId, courseId } });
    if (existing) {
      throw new ConflictException('Enrollment request already exists');
    }

    const enrollment = this.enrollmentsRepository.create({
      learnerId,
      courseId,
      status: EnrollmentStatus.PENDING,
    });

    const saved = await this.enrollmentsRepository.save(enrollment);

    const learner = await this.usersService.findByIdOrFail(learnerId);
    const instructorLang = course.instructor?.preferences?.lang || 'ar';

    const subject = this.i18nService.translate('translation.notifications.subjects.enrollment_request', { lang: instructorLang });
    const message = this.i18nService.translate('translation.notifications.messages.enrollment_request', {
      lang: instructorLang,
      args: { name: learner.firstName + ' ' + learner.lastName, course: course.title },
    });

    await this.notificationsService.create(
      course.instructorId,
      NotificationType.ENROLLMENT_REQUEST,
      subject,
      message,
      { enrollmentId: saved.id, courseId, learnerId },
      'course',
      courseId,
    );

    return saved;
  }

  async respondToEnrollment(id: string, instructorId: string, respondDto: RespondEnrollmentDto): Promise<Enrollment> {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course');
    }

    enrollment.status = respondDto.status;
    enrollment.respondedAt = new Date();

    const saved = await this.enrollmentsRepository.save(enrollment);

    const learner = await this.usersService.findByIdOrFail(enrollment.learnerId);
    const learnerLang = learner.preferences?.lang || 'ar';
    const isApproved = respondDto.status === EnrollmentStatus.APPROVED;

    const subjectKey = isApproved ? 'notifications.subjects.enrollment_approved' : 'notifications.subjects.enrollment_rejected';
    const messageKey = isApproved ? 'notifications.messages.enrollment_approved' : 'notifications.messages.enrollment_rejected';

    const subject = this.i18nService.translate('translation.' + subjectKey, { lang: learnerLang });
    const message = this.i18nService.translate('translation.' + messageKey, {
      lang: learnerLang,
      args: { course: enrollment.course.title },
    });

    await this.notificationsService.create(
      enrollment.learnerId,
      NotificationType.ENROLLMENT_RESPONSE,
      subject,
      message,
      { enrollmentId: id, courseId: enrollment.courseId, status: respondDto.status },
      'course',
      enrollment.courseId,
    );

    return saved;
  }

  async inviteLearner(courseId: string, instructorId: string, inviteDto: InviteLearnerDto): Promise<Enrollment> {
    await this.coursesService.findInstructorCourse(courseId, instructorId);

    const user = await this.usersService.findByEmail(inviteDto.email);
    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    const existing = await this.enrollmentsRepository.findOne({ where: { learnerId: user.id, courseId } });
    if (existing) {
      throw new ConflictException('User is already enrolled or requested');
    }

    const enrollment = this.enrollmentsRepository.create({
      learnerId: user.id,
      courseId,
      status: EnrollmentStatus.APPROVED,
      respondedAt: new Date(),
    });

    return this.enrollmentsRepository.save(enrollment);
  }

  async getLearnerEnrollments(learnerId: string): Promise<Enrollment[]> {
    return this.enrollmentsRepository.find({
      where: { learnerId },
      relations: ['course', 'course.instructor'],
      order: { createdAt: 'DESC' },
    });
  }

  async getCourseEnrollments(courseId: string, instructorId: string): Promise<Enrollment[]> {
    await this.coursesService.findInstructorCourse(courseId, instructorId);

    return this.enrollmentsRepository.find({
      where: { courseId },
      relations: ['learner'],
      order: { createdAt: 'DESC' },
    });
  }

  async isEnrolled(learnerId: string, courseId: string): Promise<boolean> {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { learnerId, courseId, status: EnrollmentStatus.APPROVED },
    });
    return !!enrollment;
  }

  async removeLearner(id: string, instructorId: string): Promise<void> {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course');
    }

    await super.remove(id);
  }
}
