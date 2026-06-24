import { Injectable } from '@nestjs/common';
import { MailProvider } from './providers/mail-provider.interface';

@Injectable()
export class MailService {
  constructor(private mailProvider: MailProvider) {}

  async sendNewContentNotification(to: string[], courseName: string, contentTitle: string) {
    await this.mailProvider.sendMail({
      to,
      subject: `New content in ${courseName}`,
      template: 'new-content',
      context: { courseName, contentTitle },
    });
  }

  async sendEnrollmentRequest(to: string, learnerName: string, courseName: string) {
    await this.mailProvider.sendMail({
      to,
      subject: `Enrollment Request: ${courseName}`,
      template: 'enrollment-request',
      context: { learnerName, courseName },
    });
  }

  async sendEnrollmentApproved(to: string, courseName: string) {
    await this.mailProvider.sendMail({
      to,
      subject: `Enrollment Approved: ${courseName}`,
      template: 'enrollment-approved',
      context: { courseName },
    });
  }

  async sendEnrollmentRejected(to: string, courseName: string) {
    await this.mailProvider.sendMail({
      to,
      subject: `Enrollment Update: ${courseName}`,
      template: 'enrollment-rejected',
      context: { courseName },
    });
  }

  async sendCourseInvitation(to: string, instructorName: string, courseName: string) {
    await this.mailProvider.sendMail({
      to,
      subject: `Invitation to join ${courseName}`,
      template: 'course-invitation',
      context: { instructorName, courseName },
    });
  }

  async sendVerificationEmail(to: string, verificationUrl: string) {
    await this.mailProvider.sendMail({
      to,
      subject: 'Verify your email address',
      template: 'email-verification',
      context: { verificationUrl },
    });
  }

  async sendPasswordResetEmail(to: string, resetUrl: string) {
    await this.mailProvider.sendMail({
      to,
      subject: 'Reset your password',
      template: 'reset-password',
      context: { resetUrl },
    });
  }
}
