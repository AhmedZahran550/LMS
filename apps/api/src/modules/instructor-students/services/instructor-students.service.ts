import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { I18nService } from "nestjs-i18n";
import {
  PaginateConfig,
  FilterOperator,
  PaginateQuery,
  paginate,
} from "nestjs-paginate";
import { DBService } from "../../../db/db.service";
import { InstructorStudent } from "../../../db/entities/instructor-student.entity";
import { User } from "../../../db/entities/user.entity";
import { Course } from "../../../db/entities/course.entity";
import { MailService } from "../../mail/mail.service";
import {
  InstructorStudentStatus,
  InvitedBy,
  UserRole,
} from "@lms/shared-types";
import { InviteStudentDto } from "../dto/invite-student.dto";
import { RespondRequestDto, RequestAction } from "../dto/respond-request.dto";

export const INSTRUCTOR_STUDENT_PAGINATION_CONFIG: PaginateConfig<InstructorStudent> =
  {
    sortableColumns: ["createdAt", "status"],
    nullSort: "last",
    defaultSortBy: [["createdAt", "DESC"]],
    searchableColumns: [
      "student.firstName",
      "student.lastName",
      "student.email",
      "invitedEmail",
    ],
    filterableColumns: {
      status: [FilterOperator.EQ],
      instructorId: [FilterOperator.EQ],
      studentId: [FilterOperator.EQ],
    },
    relations: ["student"],
    select: [
      "id",
      "createdAt",
      "updatedAt",
      "instructorId",
      "studentId",
      "invitedEmail",
      "status",
      "invitedBy",
      "invitationSentAt",
      "respondedAt",
      "student.id",
      "student.firstName",
      "student.lastName",
      "student.email",
      "student.profileImageUrl",
    ],
  };

export const INSTRUCTOR_SEARCH_PAGINATION_CONFIG: PaginateConfig<User> = {
  sortableColumns: ["firstName", "lastName", "createdAt"],
  nullSort: "last",
  defaultSortBy: [["firstName", "ASC"]],
  searchableColumns: ["firstName", "lastName"],
  filterableColumns: {},
  select: ["id", "firstName", "lastName", "profileImageUrl"],
};

@Injectable()
export class InstructorStudentsService extends DBService<InstructorStudent> {
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
  ) {
    super(instructorStudentRepo, INSTRUCTOR_STUDENT_PAGINATION_CONFIG);
  }

  async invite(
    instructorId: string,
    dto: InviteStudentDto,
  ): Promise<InstructorStudent> {
    const instructor = await this.userRepo.findOne({
      where: { id: instructorId },
    });
    const student = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (student) {
      const existingLink = await this.instructorStudentRepo.findOne({
        where: { instructorId, studentId: student.id },
      });
      if (existingLink) {
        throw new ConflictException(this.i18n.t("errors.ALREADY_LINKED"));
      }
    }

    const token = this.jwtService.sign(
      { instructorId, email: dto.email },
      { expiresIn: "7d" },
    );

    const link = this.instructorStudentRepo.create({
      instructorId,
      studentId: student?.id ?? null,
      invitedEmail: dto.email,
      status: InstructorStudentStatus.INVITED,
      invitedBy: InvitedBy.INSTRUCTOR,
      invitationToken: token,
      invitationSentAt: new Date(),
    });

    const saved = await this.instructorStudentRepo.save(link);

    const acceptUrl = `${process.env.APP_URL}/invitations/accept?token=${token}`;
    await this.mailService.sendStudentInvitation(
      dto.email,
      instructor
        ? `${instructor.firstName} ${instructor.lastName}`
        : "An instructor",
      acceptUrl,
    );

    return saved;
  }

  async listStudents(instructorId: string, query: PaginateQuery) {
    const qb = this.instructorStudentRepo
      .createQueryBuilder("instructor_student")
      .where("instructor_student.instructorId = :instructorId", {
        instructorId,
      });
    return this.findAll(query, qb);
  }

  async listRequests(instructorId: string, query: PaginateQuery) {
    const qb = this.instructorStudentRepo
      .createQueryBuilder("instructor_student")
      .where("instructor_student.instructorId = :instructorId", {
        instructorId,
      })
      .andWhere("instructor_student.status = :status", {
        status: InstructorStudentStatus.REQUESTED,
      });

    return this.findAll(query, qb);
  }

  async respondToRequest(
    instructorId: string,
    linkId: string,
    dto: RespondRequestDto,
  ): Promise<InstructorStudent> {
    const link = await this.instructorStudentRepo.findOne({
      where: {
        id: linkId,
        instructorId,
        status: InstructorStudentStatus.REQUESTED,
      },
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

  async removeStudent(
    instructorId: string,
    linkId: string,
  ): Promise<InstructorStudent> {
    const link = await this.instructorStudentRepo.findOne({
      where: {
        id: linkId,
        instructorId,
        status: InstructorStudentStatus.ACTIVE,
      },
    });
    if (!link) throw new NotFoundException();

    link.status = InstructorStudentStatus.REMOVED;
    link.respondedAt = new Date();
    return this.instructorStudentRepo.save(link);
  }

  async acceptInvitation(
    token: string,
    userId: string,
  ): Promise<InstructorStudent> {
    let payload: { instructorId: string; email: string };
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new ForbiddenException(
        this.i18n.t("errors.INVALID_INVITATION_TOKEN"),
      );
    }

    const student = await this.userRepo.findOne({ where: { id: userId } });
    if (!student)
      throw new NotFoundException(this.i18n.t("errors.USER_NOT_FOUND"));

    if (student.email !== payload.email) {
      throw new ForbiddenException(
        this.i18n.t("errors.INVALID_INVITATION_TOKEN"),
      );
    }

    const link = await this.instructorStudentRepo.findOne({
      where: [
        {
          instructorId: payload.instructorId,
          studentId: userId,
          status: InstructorStudentStatus.INVITED,
        },
        {
          instructorId: payload.instructorId,
          invitedEmail: payload.email,
          status: InstructorStudentStatus.INVITED,
        },
      ],
    });
    if (!link)
      throw new NotFoundException(this.i18n.t("errors.INVITATION_EXPIRED"));

    link.studentId = userId;
    link.status = InstructorStudentStatus.ACTIVE;
    link.respondedAt = new Date();
    link.invitationToken = null;
    return this.instructorStudentRepo.save(link);
  }

  async requestToJoin(
    studentId: string,
    instructorId: string,
  ): Promise<InstructorStudent> {
    const existingLink = await this.instructorStudentRepo.findOne({
      where: { instructorId, studentId },
    });
    if (existingLink) {
      throw new ConflictException(this.i18n.t("errors.ALREADY_LINKED"));
    }

    const link = this.instructorStudentRepo.create({
      instructorId,
      studentId,
      status: InstructorStudentStatus.REQUESTED,
      invitedBy: InvitedBy.STUDENT,
    });

    return this.instructorStudentRepo.save(link);
  }

  async searchInstructors(query: PaginateQuery) {
    const qb = this.userRepo
      .createQueryBuilder("user")
      .where("user.role = :role", { role: UserRole.INSTRUCTOR })
      .andWhere("user.isActive = :isActive", { isActive: true });

    return paginate(query, qb, INSTRUCTOR_SEARCH_PAGINATION_CONFIG);
  }

  async getMyInstructors(studentId: string) {
    const links = await this.instructorStudentRepo.find({
      where: { studentId, status: InstructorStudentStatus.ACTIVE },
      relations: ["instructor"],
      order: { createdAt: "DESC" },
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
      where: {
        studentId,
        instructorId,
        status: InstructorStudentStatus.ACTIVE,
      },
    });
    if (!link) throw new NotFoundException();

    const courses = await this.courseRepo.find({
      where: { instructorId },
      order: { createdAt: "DESC" },
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
      throw new ForbiddenException(
        this.i18n.t("errors.INVALID_INVITATION_TOKEN"),
      );
    }

    const instructor = await this.userRepo.findOne({
      where: { id: payload.instructorId },
    });
    if (!instructor) throw new NotFoundException();

    return {
      instructorName: `${instructor.firstName} ${instructor.lastName}`,
      instructorEmail: instructor.email,
      instructorProfileImageUrl: instructor.profileImageUrl,
      studentEmail: payload.email,
    };
  }
}
