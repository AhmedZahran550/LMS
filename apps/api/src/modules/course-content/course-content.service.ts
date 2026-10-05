import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaginateConfig, FilterOperator, PaginateQuery } from "nestjs-paginate";
import { DBService } from "../../db/db.service";
import { CourseContent } from "../../db/entities/course-content.entity";
import { CoursePurchase } from "../../db/entities/course-purchase.entity";
import { User } from "../../db/entities/user.entity";
import { CreateCourseContentDto } from "./dto/create-course-content.dto";
import { UpdateCourseContentDto } from "./dto/update-course-content.dto";
import { ReorderCourseContentDto } from "./dto/reorder-course-content.dto";
import { CompleteCourseContentUploadDto } from "./dto/complete-course-content-upload.dto";
import { CoursesService } from "../courses/courses.service";
import { StorageService } from "../storage/storage.service";
import { NotificationsService } from "../notifications/notifications.service";
import { UploadService } from "../upload/upload.service";
import { I18nService } from "nestjs-i18n";
import {
  ContentType,
  PurchaseStatus,
  NotificationType,
  UploadSessionStatus,
} from "@lms/shared-types";

export const CONTENT_PAGINATION_CONFIG: PaginateConfig<CourseContent> = {
  sortableColumns: ["createdAt", "orderIndex", "title"],
  nullSort: "last",
  defaultSortBy: [["orderIndex", "ASC"]],
  searchableColumns: ["title", "description"],
  filterableColumns: {
    courseId: [FilterOperator.EQ],
    contentType: [FilterOperator.EQ],
    isPreview: [FilterOperator.EQ],
  },
};

function inferContentType(mimeType: string): ContentType {
  if (mimeType.startsWith("video/")) return ContentType.VIDEO;
  if (mimeType === "application/pdf") return ContentType.PDF;
  if (mimeType.startsWith("image/")) return ContentType.IMAGE;
  if (
    mimeType === "application/vnd.ms-powerpoint" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    return ContentType.PRESENTATION;
  }
  return ContentType.VIDEO;
}

@Injectable()
export class CourseContentService extends DBService<
  CourseContent,
  CreateCourseContentDto,
  UpdateCourseContentDto
> {
  constructor(
    @InjectRepository(CourseContent)
    private readonly contentRepository: Repository<CourseContent>,
    @InjectRepository(CoursePurchase)
    private readonly purchaseRepository: Repository<CoursePurchase>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly coursesService: CoursesService,
    private readonly storageService: StorageService,
    private readonly notificationsService: NotificationsService,
    private readonly uploadService: UploadService,
    private readonly i18nService: I18nService,
  ) {
    super(contentRepository, CONTENT_PAGINATION_CONFIG);
  }

  async completeDirectUpload(
    courseId: string,
    instructorId: string,
    dto: CompleteCourseContentUploadDto,
  ): Promise<CourseContent> {
    const course = await this.coursesService.findInstructorCourse(courseId, instructorId);

    const session = await this.uploadService.findSessionById(dto.sessionId);

    if (session.courseId !== courseId || session.instructorId !== instructorId) {
      throw new ForbiddenException('Invalid upload session for this course');
    }

    if (session.status === UploadSessionStatus.COMPLETED) {
      throw new BadRequestException('Upload session has already been completed');
    }

    if (session.status !== UploadSessionStatus.PENDING) {
      throw new BadRequestException(`Cannot complete upload. Session status is ${session.status}`);
    }

    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      session.status = UploadSessionStatus.EXPIRED;
      await this.uploadService.saveSession(session);
      throw new BadRequestException('Upload session has expired');
    }

    let finalUrl = '';
    let finalFilename = '';
    let finalSize = 0;
    let finalMimeType = session.mimeType;

    const publicId = dto.cloudinaryResult?.publicId || session.publicId;
    if (!publicId) {
      throw new BadRequestException(
        'Upload session has no assigned asset identifier',
      );
    }

    // The client must never be able to commit an asset it was not granted.
    if (
      session.publicId &&
      dto.cloudinaryResult?.publicId &&
      dto.cloudinaryResult.publicId !== session.publicId
    ) {
      throw new ForbiddenException(
        'Uploaded asset does not match the pre-flight assigned identifier',
      );
    }

    const verified = await this.storageService.verifyUploadedAsset(publicId, {
      resourceType: dto.cloudinaryResult?.resourceType || session.mimeType,
    });

    if (verified) {
      finalUrl = verified.url;
      finalFilename = verified.filename;
      finalSize = verified.size;
      finalMimeType = verified.mimeType;
    } else if (dto.cloudinaryResult?.secureUrl) {
      finalUrl = dto.cloudinaryResult.secureUrl;
      finalFilename = dto.cloudinaryResult.publicId || publicId;
      finalSize = dto.cloudinaryResult.bytes || Number(session.fileSize);
    } else {
      throw new BadRequestException(
        'Could not verify the uploaded asset in cloud storage',
      );
    }

    const contentType = inferContentType(finalMimeType);

    const lastContent = await this.contentRepository.findOne({
      where: { courseId },
      order: { orderIndex: 'DESC' },
    });
    const orderIndex = lastContent ? lastContent.orderIndex + 1 : 0;

    const content = this.contentRepository.create({
      courseId,
      title: dto.title,
      description: dto.description,
      url: finalUrl,
      filename: finalFilename,
      mimeType: finalMimeType,
      size: finalSize,
      orderIndex,
      contentType,
      isPreview: dto.isPreview ?? false,
    });

    const saved = await this.contentRepository.save(content);

    session.status = UploadSessionStatus.COMPLETED;
    session.uploadedBytes = String(finalSize);
    await this.uploadService.saveSession(session);

    // Notify students who purchased this course
    const completedPurchases = await this.purchaseRepository.find({
      where: { courseId, status: PurchaseStatus.COMPLETED },
      relations: ['student'],
    });

    if (completedPurchases.length > 0) {
      const langGroups: Record<string, string[]> = {};

      for (const purchase of completedPurchases) {
        const lang = (purchase.student as any)?.preferences?.lang || 'ar';
        if (!langGroups[lang]) langGroups[lang] = [];
        langGroups[lang].push(purchase.studentId);
      }

      for (const [lang, userIds] of Object.entries(langGroups)) {
        const subject = this.i18nService.translate(
          'translation.notifications.subjects.new_content',
          { lang },
        );
        const message = this.i18nService.translate(
          'translation.notifications.messages.new_content',
          {
            lang,
            args: { content: dto.title, course: course.title },
          },
        );

        this.notificationsService.createMany(
          userIds,
          NotificationType.NEW_CONTENT,
          subject,
          message,
          { courseId, contentId: saved.id, title: dto.title },
          'content',
          saved.id,
        );
      }
    }

    return saved;
  }

  async findCourseContents(courseId: string): Promise<CourseContent[]> {
    return this.contentRepository.find({
      where: { courseId },
      order: { orderIndex: "ASC" },
    });
  }

  async findPreviewCourseContents(courseId: string): Promise<CourseContent[]> {
    return this.contentRepository.find({
      where: { courseId, isPreview: true },
      order: { orderIndex: "ASC" },
    });
  }

  async findPaginatedCourseContents(
    courseId: string,
    instructorId: string,
    query: PaginateQuery,
  ) {
    return this.findAll({
      ...query,
      where: { courseId, course: { instructorId } },
    });
  }

  async findLearnerPaginatedCourseContents(
    courseId: string,
    learnerId: string,
    query: PaginateQuery,
  ) {
    const qb = this.contentRepository.createQueryBuilder("content");
    qb.leftJoin("content.course", "course")
      .leftJoin("course.purchases", "purchase")
      .where("content.courseId = :courseId", { courseId })
      .andWhere("purchase.studentId = :learnerId", { learnerId })
      .andWhere("purchase.status = :status", {
        status: PurchaseStatus.COMPLETED,
      });
    return this.findAll({ ...query }, qb);
  }

  async findCourseContentById(
    courseId: string,
    contentId: string,
    learnerId?: string,
  ): Promise<CourseContent> {
    const qb = this.contentRepository.createQueryBuilder("content");
    qb.leftJoin("content.course", "course");

    if (learnerId) {
      qb.leftJoin("course.purchases", "purchase")
        .where("content.courseId = :courseId", { courseId })
        .andWhere("content.id = :contentId", { contentId })
        .andWhere(
          "(content.isPreview = true OR (purchase.studentId = :learnerId AND purchase.status = :status))",
          {
            learnerId,
            status: PurchaseStatus.COMPLETED,
          },
        );
    } else {
      qb.where("content.courseId = :courseId", { courseId }).andWhere(
        "content.id = :contentId",
        { contentId },
      );
    }

    const content = await qb.getOne();
    if (!content) {
      throw new NotFoundException("Course content not found or access denied");
    }
    return content;
  }

  async updateCourseContent(
    courseId: string,
    contentId: string,
    instructorId: string,
    updateDto: UpdateCourseContentDto,
  ): Promise<CourseContent> {
    await this.coursesService.findInstructorCourse(courseId, instructorId);

    const content = await this.findCourseContentById(courseId, contentId);
    Object.assign(content, updateDto);

    return this.contentRepository.save(content);
  }

  async removeCourseContent(
    courseId: string,
    contentId: string,
    instructorId: string,
  ): Promise<void> {
    await this.coursesService.findInstructorCourse(courseId, instructorId);

    const content = await this.findCourseContentById(courseId, contentId);

    await this.storageService.delete(content.filename);

    await this.contentRepository.remove(content);
  }

  async reorder(
    courseId: string,
    instructorId: string,
    reorderDto: ReorderCourseContentDto,
  ): Promise<CourseContent[]> {
    await this.coursesService.findInstructorCourse(courseId, instructorId);

    const contents = await this.findCourseContents(courseId);
    const ids = reorderDto.contentIds || reorderDto.videoIds;

    if (!ids || ids.length === 0) {
      throw new BadRequestException("Must provide contentIds to reorder");
    }

    if (contents.length !== ids.length) {
      throw new BadRequestException("Must provide all content IDs to reorder");
    }

    const contentMap = new Map(contents.map((c) => [c.id, c]));

    const updatedContents = ids.map((id, index) => {
      const content = contentMap.get(id);
      if (!content)
        throw new BadRequestException("Content ID " + id + " is invalid");
      content.orderIndex = index;
      return content;
    });

    await this.contentRepository.save(updatedContents);
    return updatedContents;
  }
}
