import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginateQuery, paginate } from 'nestjs-paginate';
import { CoursePurchase } from '../../db/entities/course-purchase.entity';
import { Course } from '../../db/entities/course.entity';
import { User } from '../../db/entities/user.entity';
import { KashierService } from '../payments/kashier.service';
import { SystemConfigService } from '../system-config/system-config.service';
import { PurchaseStatus } from '@lms/shared-types';

@Injectable()
export class CoursePurchasesService {
  private readonly logger = new Logger(CoursePurchasesService.name);

  constructor(
    @InjectRepository(CoursePurchase)
    private readonly purchaseRepository: Repository<CoursePurchase>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly kashierService: KashierService,
    private readonly systemConfigService: SystemConfigService,
  ) {}

  async initiatePurchase(studentId: string, courseId: string) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, isActive: true },
      relations: ['instructor'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const student = await this.userRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException('Student account not found');
    }

    // Check if student already purchased this course
    const existing = await this.purchaseRepository.findOne({
      where: { studentId, courseId },
    });

    if (existing && existing.status === PurchaseStatus.COMPLETED) {
      throw new ConflictException('You have already enrolled in this course');
    }

    const price = Number(course.price);

    // Free course enrollment
    if (price === 0) {
      let purchase = existing;
      if (!purchase) {
        purchase = this.purchaseRepository.create({
          studentId,
          courseId,
        });
      }
      purchase.amount = 0;
      purchase.platformCommission = 0;
      purchase.teacherRevenue = 0;
      purchase.currency = course.currency || 'egp';
      purchase.status = PurchaseStatus.COMPLETED;
      purchase.purchasedAt = new Date();

      const saved = await this.purchaseRepository.save(purchase);
      return {
        isFree: true,
        purchaseId: saved.id,
      };
    }

    // Paid course: Initiate Kashier checkout
    const orderId = `course_${courseId.replace(/-/g, '').substring(0, 8)}_${studentId.replace(/-/g, '').substring(0, 8)}_${Date.now()}`;

    let purchase = existing;
    if (!purchase) {
      purchase = this.purchaseRepository.create({
        studentId,
        courseId,
      });
    }

    purchase.amount = price;
    purchase.currency = course.currency || 'egp';
    purchase.status = PurchaseStatus.PENDING;
    purchase.kashierOrderId = orderId;

    await this.purchaseRepository.save(purchase);

    const session = await this.kashierService.createPaymentSession({
      orderId,
      amount: price,
      currency: course.currency || 'EGP',
      customerEmail: student.email,
      customerName: `${student.firstName} ${student.lastName}`.trim(),
      description: `Enrollment: ${course.title}`,
    });

    return {
      isFree: false,
      purchaseId: purchase.id,
      orderId,
      checkoutUrl: session.checkoutUrl,
    };
  }

  async completePurchase(orderId: string, paymentId?: string): Promise<CoursePurchase | null> {
    const purchase = await this.purchaseRepository.findOne({
      where: { kashierOrderId: orderId },
      relations: ['course'],
    });

    if (!purchase) {
      this.logger.warn(`No purchase found for Kashier order: ${orderId}`);
      return null;
    }

    if (purchase.status === PurchaseStatus.COMPLETED) {
      return purchase;
    }

    const fixedCommission = await this.systemConfigService.getFixedCommission();
    const price = Number(purchase.amount);
    const platformCommission = Math.min(price, fixedCommission);
    const teacherRevenue = Math.max(0, price - platformCommission);

    purchase.platformCommission = platformCommission;
    purchase.teacherRevenue = teacherRevenue;
    purchase.status = PurchaseStatus.COMPLETED;
    purchase.purchasedAt = new Date();
    if (paymentId) {
      purchase.kashierPaymentId = paymentId;
    }

    const saved = await this.purchaseRepository.save(purchase);
    this.logger.log(`Completed purchase for order ${orderId}: teacher revenue ${teacherRevenue} EGP, platform commission ${platformCommission} EGP`);
    return saved;
  }

  async hasPurchased(studentId: string, courseId: string): Promise<boolean> {
    const count = await this.purchaseRepository.count({
      where: {
        studentId,
        courseId,
        status: PurchaseStatus.COMPLETED,
      },
    });
    return count > 0;
  }

  async getStudentCourses(studentId: string, query: PaginateQuery) {
    const qb = this.purchaseRepository.createQueryBuilder('purchase')
      .innerJoinAndSelect('purchase.course', 'course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.category', 'category')
      .where('purchase.studentId = :studentId', { studentId })
      .andWhere('purchase.status = :status', { status: PurchaseStatus.COMPLETED });

    return paginate(query, qb, {
      sortableColumns: ['purchasedAt', 'createdAt'],
      defaultSortBy: [['purchasedAt', 'DESC']],
      searchableColumns: ['course.title', 'course.description'],
    });
  }

  async getStudentCourseById(studentId: string, courseId: string) {
    const isEnrolled = await this.hasPurchased(studentId, courseId);
    if (!isEnrolled) {
      throw new ForbiddenException('You must purchase this course to access its full content');
    }

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['instructor', 'category', 'contents'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async getCourseSales(courseId: string, instructorId: string) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, instructorId },
    });

    if (!course) {
      throw new ForbiddenException('You do not own this course or it does not exist');
    }

    const sales = await this.purchaseRepository.find({
      where: { courseId, status: PurchaseStatus.COMPLETED },
      relations: ['student'],
      order: { purchasedAt: 'DESC' },
    });

    return sales.map((sale) => ({
      purchaseId: sale.id,
      studentId: sale.studentId,
      studentName: `${sale.student?.firstName || ''} ${sale.student?.lastName || ''}`.trim(),
      studentEmail: sale.student?.email,
      faculty: sale.student?.faculty,
      department: sale.student?.department,
      year: sale.student?.year,
      amount: Number(sale.amount),
      platformCommission: Number(sale.platformCommission),
      teacherRevenue: Number(sale.teacherRevenue),
      purchasedAt: sale.purchasedAt,
    }));
  }

  async getInstructorRevenue(instructorId: string) {
    const stats = await this.purchaseRepository.createQueryBuilder('purchase')
      .innerJoin('purchase.course', 'course')
      .select('COUNT(purchase.id)', 'totalSalesCount')
      .addSelect('COALESCE(SUM(purchase.amount), 0)', 'totalGrossRevenue')
      .addSelect('COALESCE(SUM(purchase.platformCommission), 0)', 'totalPlatformCommission')
      .addSelect('COALESCE(SUM(purchase.teacherRevenue), 0)', 'totalNetRevenue')
      .where('course.instructorId = :instructorId', { instructorId })
      .andWhere('purchase.status = :status', { status: PurchaseStatus.COMPLETED })
      .getRawOne();

    return {
      totalSalesCount: parseInt(stats?.totalSalesCount || '0', 10),
      totalGrossRevenue: parseFloat(stats?.totalGrossRevenue || '0'),
      totalPlatformCommission: parseFloat(stats?.totalPlatformCommission || '0'),
      totalNetRevenue: parseFloat(stats?.totalNetRevenue || '0'),
    };
  }
}
