import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import { InstructorStudent } from '../../../db/entities/instructor-student.entity';
import { User } from '../../../db/entities/user.entity';
import { Course } from '../../../db/entities/course.entity';
import { MailService } from '../../mail/mail.service';
import { InstructorStudentStatus, InvitedBy, UserRole } from '@lms/shared-types';
import { InviteStudentDto } from '../dto/invite-student.dto';
import { RespondRequestDto, RequestAction } from '../dto/respond-request.dto';

@Injectable()
export class InstructorStudentsService {
  constructor(
    @InjectRepository(InstructorStudent)
    private readonly instructorStudentRepo: Repository<InstructorStudent>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
    private readonly mailService: MailService,
  ) {}

  async invite(instructorId: string, dto: InviteStudentDto): Promise<InstructorStudent> {
    const instructor = await this.userRepo.findOne({ where: { id: instructorId } });
    const student = await this.userRepo.findOne({ where: { email: dto.email } });

    if (student) {
      const existingLink = await this.instructorStudentRepo.findOne({
        where: { instructorId, studentId: student.id },
      });
      if (existingLink) {
        throw new ConflictException(this.i18n.t('errors.ALREADY_LINKED'));
      }
    }

    const token = this.jwtService.sign(
      { instructorId, email: dto.email },
      { expiresIn: '7d' },
    );

    const link = this.instructorStudentRepo.create({
      instructorId,
      studentId: student?.id,
      status: InstructorStudentStatus.INVITED,
      invitedBy: InvitedBy.INSTRUCTOR,
      invitationToken: token,
      invitationSentAt: new Date(),
    });

    const saved = await this.instructorStudentRepo.save(link);

    const acceptUrl = `${process.env.APP_URL}/invitations/accept?token=${token}`;
    await this.mailService.sendStudentInvitation(
      dto.email,
      instructor ? `${instructor.firstName} ${instructor.lastName}` : 'An instructor',
      acceptUrl,
    );

    return saved;
  }

  async listStudents(instructorId: string, status?: InstructorStudentStatus, page = 1, limit = 20) {
    const where: any = { instructorId };
    if (status) where.status = status;

    const [items, total] = await this.instructorStudentRepo.findAndCount({
      where,
      relations: ['student'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async listRequests(instructorId: string, page = 1, limit = 20) {
    return this.listStudents(instructorId, InstructorStudentStatus.REQUESTED, page, limit);
  }

  async respondToRequest(instructorId: string, linkId: string, dto: RespondRequestDto): Promise<InstructorStudent> {
    const link = await this.instructorStudentRepo.findOne({
      where: { id: linkId, instructorId, status: InstructorStudentStatus.REQUESTED },
    });
    if (!link) throw new NotFoundException();

    if (dto.action === RequestAction.APPROVE) {
      link.status = InstructorStudentStatus.ACTIVE;
    } else {
      link.status = InstructorStudentStatus.REMOVED;
    }
    link.respondedAt = new Date();

    return this.instructorStudentRepo.save(link);
  }

  async removeStudent(instructorId: string, linkId: string): Promise<InstructorStudent> {
    const link = await this.instructorStudentRepo.findOne({
      where: { id: linkId, instructorId, status: InstructorStudentStatus.ACTIVE },
    });
    if (!link) throw new NotFoundException();

    link.status = InstructorStudentStatus.REMOVED;
    link.respondedAt = new Date();
    return this.instructorStudentRepo.save(link);
  }

  async acceptInvitation(token: string, userId: string): Promise<InstructorStudent> {
    let payload: { instructorId: string; email: string };
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new ForbiddenException(this.i18n.t('errors.INVALID_INVITATION_TOKEN'));
    }

    const student = await this.userRepo.findOne({ where: { id: userId } });
    if (!student) throw new NotFoundException(this.i18n.t('errors.USER_NOT_FOUND'));

    if (student.email !== payload.email) {
      throw new ForbiddenException(this.i18n.t('errors.INVALID_INVITATION_TOKEN'));
    }

    const link = await this.instructorStudentRepo.findOne({
      where: { instructorId: payload.instructorId, studentId: userId, status: InstructorStudentStatus.INVITED },
    });
    if (!link) throw new NotFoundException(this.i18n.t('errors.INVITATION_EXPIRED'));

    link.status = InstructorStudentStatus.ACTIVE;
    link.respondedAt = new Date();
    link.invitationToken = null;
    return this.instructorStudentRepo.save(link);
  }

  async requestToJoin(studentId: string, instructorId: string): Promise<InstructorStudent> {
    const existingLink = await this.instructorStudentRepo.findOne({
      where: { instructorId, studentId },
    });
    if (existingLink) {
      throw new ConflictException(this.i18n.t('errors.ALREADY_LINKED'));
    }

    const link = this.instructorStudentRepo.create({
      instructorId,
      studentId,
      status: InstructorStudentStatus.REQUESTED,
      invitedBy: InvitedBy.STUDENT,
    });

    return this.instructorStudentRepo.save(link);
  }

  async searchInstructors(query: string, page = 1, limit = 20) {
    const [items, total] = await this.userRepo.findAndCount({
      where: { role: UserRole.INSTRUCTOR, isActive: true } as any,
      skip: (page - 1) * limit,
      take: limit,
    });

    const filtered = items.filter(
      (u) =>
        u.firstName.toLowerCase().includes(query.toLowerCase()) ||
        u.lastName.toLowerCase().includes(query.toLowerCase()),
    );

    return {
      items: filtered.map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        profileImageUrl: u.profileImageUrl,
      })),
      meta: { total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) },
    };
  }

  async getMyInstructors(studentId: string) {
    const links = await this.instructorStudentRepo.find({
      where: { studentId, status: InstructorStudentStatus.ACTIVE },
      relations: ['instructor'],
      order: { createdAt: 'DESC' },
    });

    return links.map((link) => ({
      id: link.id,
      instructorId: link.instructorId,
      firstName: link.instructor.firstName,
      lastName: link.instructor.lastName,
      profileImageUrl: link.instructor.profileImageUrl,
    }));
  }

  async getInstructorCourses(studentId: string, instructorId: string) {
    const link = await this.instructorStudentRepo.findOne({
      where: { studentId, instructorId, status: InstructorStudentStatus.ACTIVE },
    });
    if (!link) throw new NotFoundException();

    const courses = await this.courseRepo.find({
      where: { instructorId },
      order: { createdAt: 'DESC' },
    });

    return courses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      thumbnailUrl: c.thumbnailUrl,
      visibility: c.visibility,
    }));
  }

  async getStudentCount(instructorId: string): Promise<number> {
    return this.instructorStudentRepo.count({
      where: { instructorId, status: InstructorStudentStatus.ACTIVE },
    });
  }

  async getInvitationInfo(token: string) {
    let payload: { instructorId: string; email: string };
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new ForbiddenException(this.i18n.t('errors.INVALID_INVITATION_TOKEN'));
    }

    const instructor = await this.userRepo.findOne({ where: { id: payload.instructorId } });
    if (!instructor) throw new NotFoundException();

    return {
      instructorName: `${instructor.firstName} ${instructor.lastName}`,
      instructorEmail: instructor.email,
      instructorProfileImageUrl: instructor.profileImageUrl,
      studentEmail: payload.email,
    };
  }
}
